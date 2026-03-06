variable "aws_region" {
  default = "eu-north-1"
}

variable "db_username" {
  default = "admin"
}

variable "db_password" {
  description = "Production RDS password"
  sensitive   = true
}

variable "db_password_test" {
  description = "Test RDS password"
  sensitive   = true
}
