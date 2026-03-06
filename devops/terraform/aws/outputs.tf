output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "rds_production_endpoint" {
  description = "Use in overlays/production/configmap.yaml as DB_HOST"
  value       = aws_db_instance.nvr_production.endpoint
}

output "rds_test_endpoint" {
  description = "Use in overlays/test/configmap.yaml as DB_HOST"
  value       = aws_db_instance.nvr_test.endpoint
}

output "ecr_urls" {
  description = "Use these image URLs in kubernetes/base/deployments.yaml"
  value       = { for k, v in aws_ecr_repository.services : k => v.repository_url }
}

output "configure_kubectl" {
  value = "aws eks update-kubeconfig --region ${var.aws_region} --name nvr-cluster"
}
