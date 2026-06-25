# devops/terraform/gcp-cloudrun/apis.tf
# APIs were already enabled manually in Step 9 via gcloud.
# Declaring them here means Terraform tracks them and won't
# accidentally disable them if someone runs terraform destroy.
# disable_on_destroy = false protects against that scenario.

resource "google_project_service" "run_api" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "artifact_registry_api" {
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "secret_manager_api" {
  service            = "secretmanager.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "cloud_build_api" {
  service            = "cloudbuild.googleapis.com"
  disable_on_destroy = false
}