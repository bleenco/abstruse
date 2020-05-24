package job

import (
	"strconv"

	jsoniter "github.com/json-iterator/go"
)

// Job definition.
type Job struct {
	ID       uint64 `json:"id"`
	Priority uint16 `json:"priority"`
}

// Value returns JSON string.
func (j *Job) Value() string {
	value, _ := jsoniter.MarshalToString(j)
	return value
}

// Key returns key in string format.
func (j *Job) Key() string {
	return strconv.FormatUint(j.ID, 10)
}
