# devops/terraform/gcp-cloudrun/iam.tf
# Cloud Run services need permission to read secrets from Secret Manager.
# The default Compute service account is what Cloud Run uses by default
# when no custom service account is specified.

data "google_project" "project" {}

# Allow Cloud Run to access secrets
resource "google_project_iam_member" "cloudrun_secret_accessor" {
  project = var.gcp_project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}