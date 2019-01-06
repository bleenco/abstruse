package db

import "time"

// Worker defines `workers` db table.
type Worker struct {
	BaseModel

	CertID string `gorm:"not null;unique_index" json:"cert_id"`
	IP     string `json:"ip"`
	Status string `json:"status"`
}

// Create method.
func (w *Worker) Create() error {
	w.UpdatedAt = time.Now()
	w.CreatedAt = time.Now()

	return DB.Create(w).Error
}

// UpdateStatus method.
func (w *Worker) UpdateStatus(status string) error {
	return DB.Model(w).Update(map[string]interface{}{"updated_at": time.Now(), "status": status}).Error
}

// UpdateIP method.
func (w *Worker) UpdateIP(ip string) error {
	return DB.Model(w).Update(map[string]interface{}{"updated_at": time.Now(), "ip": ip}).Error
}

// FindAllWorkers finds all workers
func FindAllWorkers() ([]Worker, error) {
	var workers []Worker
	err := DB.Find(&workers).Error
	return workers, err
}

// FindWorker finds worker by certificate id.
func FindWorker(certID string) (Worker, error) {
	var worker Worker
	err := DB.First(&worker, "cert_id = ?", certID).Error
	return worker, err
}
