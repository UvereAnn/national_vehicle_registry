# devops/terraform/gcp-cloudrun/backend.tf
# Stores Terraform state in GCS instead of locally.
# The bucket was created manually in Step 9 — it can't be
# managed by the same Terraform config that uses it as a backend.

terraform {
  backend "gcs" {
    bucket = "nvr-terraform-state-bucket-v2"
    prefix = "cloudrun/state"
  }
}