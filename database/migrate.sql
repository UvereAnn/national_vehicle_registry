USE nvr_db;

ALTER TABLE vehicles ADD COLUMN approved_by INT DEFAULT NULL;
ALTER TABLE vehicles ADD COLUMN approved_at DATETIME DEFAULT NULL;
ALTER TABLE vehicles ADD COLUMN rejected_by INT DEFAULT NULL;
ALTER TABLE vehicles ADD COLUMN rejected_at DATETIME DEFAULT NULL;

UPDATE vehicles SET approved_by = reviewed_by, approved_at = updated_at WHERE status = 'approved';
UPDATE vehicles SET rejected_by = reviewed_by, rejected_at = updated_at WHERE status = 'rejected';
