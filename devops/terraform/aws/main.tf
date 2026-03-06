terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  # Uncomment after creating S3 bucket:
  # backend "s3" {
  #   bucket = "nvr-terraform-state"
  #   key    = "aws/terraform.tfstate"
  #   region = "eu-north-1"
  # }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = { Project = "NVR", ManagedBy = "Terraform" }
  }
}

# ── VPC ──────────────────────────────────────────────────────────
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"
  name    = "nvr-vpc"
  cidr    = "10.0.0.0/16"
  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true
  enable_dns_support   = true
  public_subnet_tags  = { "kubernetes.io/role/elb" = "1" }
  private_subnet_tags = { "kubernetes.io/role/internal-elb" = "1" }
}

# ── EKS ──────────────────────────────────────────────────────────
module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  version         = "20.0.0"
  cluster_name    = "nvr-cluster"
  cluster_version = "1.29"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets
  cluster_endpoint_public_access           = true
  enable_cluster_creator_admin_permissions = true

  eks_managed_node_groups = {
    nvr_nodes = {
      min_size       = 1
      max_size       = 4
      desired_size   = 2
      instance_types = ["t3.medium"]
      capacity_type  = "SPOT"
    }
  }
}

# ── SECURITY GROUP FOR RDS ────────────────────────────────────────
resource "aws_security_group" "rds" {
  name        = "nvr-rds-sg"
  description = "Allow MySQL from EKS"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_subnet_group" "nvr" {
  name       = "nvr-db-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

# ── RDS PRODUCTION DATABASE ───────────────────────────────────────
resource "aws_db_instance" "nvr_production" {
  identifier        = "nvr-mysql-production"
  engine            = "mysql"
  engine_version    = "8.0"
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  storage_type      = "gp2"
  db_name           = "nvr_db"
  username          = var.db_username
  password          = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.nvr.name
  backup_retention_period = 7
  skip_final_snapshot     = true
  deletion_protection     = false
  multi_az                = false

  tags = { Environment = "production" }
}

# ── RDS TEST DATABASE ─────────────────────────────────────────────
resource "aws_db_instance" "nvr_test" {
  identifier        = "nvr-mysql-test"
  engine            = "mysql"
  engine_version    = "8.0"
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  storage_type      = "gp2"
  db_name           = "nvr_test"
  username          = var.db_username
  password          = var.db_password_test

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.nvr.name
  backup_retention_period = 1
  skip_final_snapshot     = true
  deletion_protection     = false
  multi_az                = false

  tags = { Environment = "test" }
}

# ── ECR REPOSITORIES ─────────────────────────────────────────────
resource "aws_ecr_repository" "services" {
  for_each             = toset(["api-gateway", "auth-service", "vehicle-service", "plate-service", "frontend"])
  name                 = "nvr/${each.key}"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration { scan_on_push = true }
}

resource "aws_ecr_lifecycle_policy" "services" {
  for_each   = aws_ecr_repository.services
  repository = each.value.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Delete untagged images after 7 days"
      selection = {
        tagStatus   = "untagged"
        countType   = "sinceImagePushed"
        countUnit   = "days"
        countNumber = 7
      }
      action = { type = "expire" }
    }]
  })
}

data "aws_caller_identity" "current" {}
