# devops/terraform/gcp-cloudrun/cloud_run_services.tf
# All 5 NVR services as Cloud Run services.
# min_instance_count = 0 on all services = scale to zero when idle = $0/month
# max_instance_count = 2 = caps cost under unexpected traffic spikes
# 256Mi memory = sufficient for these small Node.js/Python services
#
# IAM: frontend + api-gateway are public (allUsers invoker)
#      auth-service, vehicle-service, plate-service are internal only
#      (only reachable via api-gateway's internal service-to-service calls)

locals {
  image_base = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/nvr-repo"
}

# ─────────────────────────────────────────────
# AUTH SERVICE
# ─────────────────────────────────────────────
resource "google_cloud_run_v2_service" "auth_service" {
  name     = "auth-service"
  location = var.gcp_region

  template {
    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }

    containers {
      image = "${local.image_base}/auth-service:${var.image_tag}"

      resources {
        cpu_idle = true  # <--- FIXED: Belongs inside resources block
        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
      }

      env {
        name = "MONGODB_URI"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.mongodb_uri.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jwt_secret.secret_id
            version = "latest"
          }
        }
      }
    }
  }

  depends_on = [
    google_project_service.run_api,
    google_project_iam_member.cloudrun_secret_accessor,
  ]
}

# Internal only — api-gateway calls it by its Cloud Run URL
resource "google_cloud_run_v2_service_iam_member" "auth_service_internal" {
  name     = google_cloud_run_v2_service.auth_service.name
  location = var.gcp_region
  role     = "roles/run.invoker"
  member   = "allUsers"  # simplified for portfolio — in production scope to api-gateway SA only
}

# ─────────────────────────────────────────────
# VEHICLE SERVICE
# ─────────────────────────────────────────────
resource "google_cloud_run_v2_service" "vehicle_service" {
  name     = "vehicle-service"
  location = var.gcp_region

  template {
    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }

    containers {
      image = "${local.image_base}/vehicle-service:${var.image_tag}"

      resources {
        cpu_idle = true  # <--- FIXED: Belongs inside resources block
        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
      }

      env {
        name = "MONGODB_URI"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.mongodb_uri.secret_id
            version = "latest"
          }
        }
      }

      # vehicle-service calls plate-service internally
      env {
        name  = "PLATE_SERVICE_URL"
        value = google_cloud_run_v2_service.plate_service.uri
      }
    }
  }

  depends_on = [
    google_project_service.run_api,
    google_project_iam_member.cloudrun_secret_accessor,
    google_cloud_run_v2_service.plate_service,
  ]
}

resource "google_cloud_run_v2_service_iam_member" "vehicle_service_public" {
  name     = google_cloud_run_v2_service.vehicle_service.name
  location = var.gcp_region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ─────────────────────────────────────────────
# PLATE SERVICE
# ─────────────────────────────────────────────
resource "google_cloud_run_v2_service" "plate_service" {
  name     = "plate-service"
  location = var.gcp_region

  template {
    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }

    containers {
      image = "${local.image_base}/plate-service:${var.image_tag}"

      resources {
        cpu_idle = true  # <--- FIXED: Belongs inside resources block
        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
      }

      env {
        name = "MONGODB_URI"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.mongodb_uri.secret_id
            version = "latest"
          }
        }
      }
    }
  }

  depends_on = [
    google_project_service.run_api,
    google_project_iam_member.cloudrun_secret_accessor,
  ]
}

resource "google_cloud_run_v2_service_iam_member" "plate_service_public" {
  name     = google_cloud_run_v2_service.plate_service.name
  location = var.gcp_region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ─────────────────────────────────────────────
# API GATEWAY (public-facing)
# ─────────────────────────────────────────────
resource "google_cloud_run_v2_service" "api_gateway" {
  name     = "api-gateway"
  location = var.gcp_region

  template {
    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }

    containers {
      image = "${local.image_base}/api-gateway:${var.image_tag}"

      resources {
        cpu_idle = true  # <--- FIXED: Belongs inside resources block
        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
      }

      # Inter-service URLs — Terraform resolves these from the other
      # services defined in this same config, no manual copy-pasting needed
      env {
        name  = "AUTH_SERVICE_URL"
        value = google_cloud_run_v2_service.auth_service.uri
      }

      env {
        name  = "VEHICLE_SERVICE_URL"
        value = google_cloud_run_v2_service.vehicle_service.uri
      }

      env {
        name  = "PLATE_SERVICE_URL"
        value = google_cloud_run_v2_service.plate_service.uri
      }

      env {
        name  = "FRONTEND_URL"
        value = "https://nationalvehicleregistry.com.ng"
      }

      env {
        name = "JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jwt_secret.secret_id
            version = "latest"
          }
        }
      }
    }
  }

  depends_on = [
    google_project_service.run_api,
    google_project_iam_member.cloudrun_secret_accessor,
    google_cloud_run_v2_service.auth_service,
    google_cloud_run_v2_service.vehicle_service,
    google_cloud_run_v2_service.plate_service,
  ]
}

# api-gateway is public — the frontend and external clients call it
resource "google_cloud_run_v2_service_iam_member" "api_gateway_public" {
  name     = google_cloud_run_v2_service.api_gateway.name
  location = var.gcp_region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ─────────────────────────────────────────────
# FRONTEND (public-facing)
# ─────────────────────────────────────────────
resource "google_cloud_run_v2_service" "frontend" {
  name     = "frontend"
  location = var.gcp_region

  template {
    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }

    containers {
      image = "${local.image_base}/frontend:${var.image_tag}"

      resources {
        cpu_idle = true  # <--- FIXED: Belongs inside resources block
        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
      }
    }
  }

  depends_on = [google_project_service.run_api]
}

resource "google_cloud_run_v2_service_iam_member" "frontend_public" {
  name     = google_cloud_run_v2_service.frontend.name
  location = var.gcp_region
  role     = "roles/run.invoker"
  member   = "allUsers"
}