package shared

import (
	"time"

	pb "github.com/jkuri/abstruse/proto"
	jsoniter "github.com/json-iterator/go"
)

// Job defines job task.
type Job struct {
	ID            uint        `json:"id"`
	BuildID       uint        `json:"build_id"`
	ContainerID   string      `json:"container_id"`
	ContainerName string      `json:"container_name"`
	WorkerID      string      `json:"worker_id"`
	Status        string      `json:"status"`
	Log           []string    `json:"log"`
	Priority      uint16      `json:"priority"`
	StartTime     time.Time   `json:"start_time"`
	EndTime       time.Time   `json:"end_time"`
	Task          *pb.JobTask `json:"task"`
}

func (j *Job) String() string {
	json, _ := jsoniter.MarshalToString(j)
	return json
}
