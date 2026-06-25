# devops/terraform/gcp-cloudrun/artifact_registry.tf
# Single Docker repository for all 5 NVR service images.
# Replaces AWS ECR from the previous architecture.

resource "google_artifact_registry_repository" "nvr_repo" {
  location      = var.gcp_region
  repository_id = "nvr-repo"
  description   = "Docker images for NVR microservices"
  format        = "DOCKER"

  depends_on = [google_project_service.artifact_registry_api]
}