# devops/terraform/gcp-cloudrun/variables.tf

variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
  default     = "nvr-uvereann-2026-v2"
}

variable "gcp_region" {
  description = "GCP region for Cloud Run and Artifact Registry"
  type        = string
  default     = "us-central1"
}

variable "image_tag" {
  description = "Docker image tag to deploy — overridden by GitHub Actions on each deploy"
  type        = string
  default     = "latest"
}

variable "mongodb_uri" {
  description = "MongoDB Atlas connection string"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret shared between auth-service and api-gateway"
  type        = string
  sensitive   = true
}