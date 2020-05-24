package scheduler

import (
	"strconv"

	jsoniter "github.com/json-iterator/go"
)

// Job definition.
type Job struct {
	ID       uint64 `json:"id"`
	Priority uint16 `json:"priority"`
}

func (j *Job) value() string {
	value, _ := jsoniter.MarshalToString(j)
	return value
}

func (j *Job) key() string {
	return strconv.FormatUint(j.ID, 10)
}

func (j *Job) priority() uint16 {
	return j.Priority
}
