# devops/terraform/gcp-cloudrun/outputs.tf
# After terraform apply, these print the live URLs for all 5 services

output "frontend_url" {
  value       = google_cloud_run_v2_service.frontend.uri
  description = "Frontend URL — visit this to access the app"
}

output "api_gateway_url" {
  value       = google_cloud_run_v2_service.api_gateway.uri
  description = "API Gateway URL — used by frontend for all /api/* calls"
}

output "auth_service_url" {
  value       = google_cloud_run_v2_service.auth_service.uri
  description = "Auth service internal URL"
}

output "vehicle_service_url" {
  value       = google_cloud_run_v2_service.vehicle_service.uri
  description = "Vehicle service internal URL"
}

output "plate_service_url" {
  value       = google_cloud_run_v2_service.plate_service.uri
  description = "Plate service internal URL"
}

output "artifact_registry_repo" {
  value       = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/nvr-repo"
  description = "Full Artifact Registry path — use as prefix when tagging images"
}