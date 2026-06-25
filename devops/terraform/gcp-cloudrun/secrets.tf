# devops/terraform/gcp-cloudrun/secrets.tf
# Stores sensitive values in Secret Manager instead of plain env vars.
# Cloud Run pulls these at container startup — never visible as
# plaintext in the Cloud Run console or in Terraform plan output
# (variables are marked sensitive: true in variables.tf).

resource "google_secret_manager_secret" "mongodb_uri" {
  secret_id = "mongodb-uri"

  replication {
    auto {}
  }

  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "mongodb_uri_version" {
  secret      = google_secret_manager_secret.mongodb_uri.id
  secret_data = var.mongodb_uri
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret"

  replication {
    auto {}
  }

  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "jwt_secret_version" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = var.jwt_secret
}