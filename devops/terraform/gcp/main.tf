terraform {
  required_version = ">= 1.7.0"
  required_providers {
    google = { source = "hashicorp/google", version = "~> 5.0" }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ── NETWORK ──────────────────────────────────────────────────────
resource "google_compute_network" "nvr" {
  name                    = "nvr-network"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "nvr" {
  name          = "nvr-subnet"
  ip_cidr_range = "10.0.0.0/16"
  region        = var.region
  network       = google_compute_network.nvr.name
}

# ── GKE CLUSTER ──────────────────────────────────────────────────
resource "google_container_cluster" "nvr" {
  name                = "nvr-cluster"
  location            = var.region
  initial_node_count  = 1
  network             = google_compute_network.nvr.name
  subnetwork          = google_compute_subnetwork.nvr.name
  deletion_protection = false
  remove_default_node_pool = true

  node_config {
    machine_type = "e2-micro"
    disk_size_gb = 30
    disk_type    = "pd-standard"
    spot         = true
    oauth_scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }
}

resource "google_container_node_pool" "nvr_nodes" {
  name     = "nvr-node-pool"
  cluster  = google_container_cluster.nvr.name
  location = var.region

  node_config {
    machine_type = "e2-micro"
    disk_size_gb = 30
    disk_type    = "pd-standard"
    spot         = true
    oauth_scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }

  autoscaling {
    min_node_count = 1
    max_node_count = 4
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }
}

# ── CLOUD SQL PRODUCTION ──────────────────────────────────────────
resource "google_sql_database_instance" "nvr_production" {
  name             = "nvr-mysql-production"
  database_version = "MYSQL_8_0"
  region           = var.region
  deletion_protection = false

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"
    backup_configuration { enabled = true }
    ip_configuration { ipv4_enabled = true }
  }
}

resource "google_sql_database" "nvr_production_db" {
  name     = "nvr_db"
  instance = google_sql_database_instance.nvr_production.name
}

resource "google_sql_user" "nvr_production_user" {
  name     = "admin"
  instance = google_sql_database_instance.nvr_production.name
  password = var.db_password
}

# ── CLOUD SQL TEST ────────────────────────────────────────────────
resource "google_sql_database_instance" "nvr_test" {
  name             = "nvr-mysql-test"
  database_version = "MYSQL_8_0"
  region           = var.region
  deletion_protection = false

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"
    backup_configuration { enabled = false }
    ip_configuration { ipv4_enabled = true }
  }
}

resource "google_sql_database" "nvr_test_db" {
  name     = "nvr_test"
  instance = google_sql_database_instance.nvr_test.name
}

resource "google_sql_user" "nvr_test_user" {
  name     = "admin"
  instance = google_sql_database_instance.nvr_test.name
  password = var.db_password_test
}

# ── ARTIFACT REGISTRY ────────────────────────────────────────────
resource "google_artifact_registry_repository" "nvr" {
  location      = var.region
  repository_id = "nvr-images"
  format        = "DOCKER"
}

output "gke_configure_kubectl" {
  value = "gcloud container clusters get-credentials nvr-cluster --region ${var.region}"
}

output "cloud_sql_production_ip" {
  value = google_sql_database_instance.nvr_production.public_ip_address
}

output "cloud_sql_test_ip" {
  value = google_sql_database_instance.nvr_test.public_ip_address
}
