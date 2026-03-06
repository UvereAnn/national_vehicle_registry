variable "project_id"       { description = "GCP Project ID" }
variable "region"           { default = "europe-west4" }
variable "db_password"      { sensitive = true }
variable "db_password_test" { sensitive = true }
