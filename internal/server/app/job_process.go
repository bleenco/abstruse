package app

import (
	"context"
	"fmt"
	"io"
	"path"

	"github.com/golang/protobuf/ptypes"
	"github.com/jkuri/abstruse/internal/pkg/util"
	pb "github.com/jkuri/abstruse/proto"
)

// JobProcess gRPC
func (w *Worker) JobProcess(job *Job) error {
	stream, err := w.cli.JobProcess(context.Background(), job.Task)
	if err != nil {
		w.logger.Errorf("error: %v", err)
		return err
	}
	defer stream.CloseSend()
	w.broadcastJobStatus(job)
	for {
		data, err := stream.Recv()
		if err != nil {
			if err == io.EOF {
				return nil
			}
			return err
		}

		switch code := data.GetCode(); code {
		case pb.JobStatus_Running:
			job.Status = "running"
			job.Task.StartTime = ptypes.TimestampNow()
			if err := w.app.saveJob(job); err != nil {
				return err
			}
			w.broadcastJobStatus(job)
		case pb.JobStatus_Passing:
			job.Status = "passing"
			job.Task.EndTime = ptypes.TimestampNow()
			if err := w.app.saveJob(job); err != nil {
				return err
			}
			w.broadcastJobStatus(job)
			w.logger.Debugf("job %d passing: %+v", job.ID, data)
		case pb.JobStatus_Failing:
			job.Status = "failing"
			job.Task.EndTime = ptypes.TimestampNow()
			if err := w.app.saveJob(job); err != nil {
				return err
			}
			w.broadcastJobStatus(job)
			w.logger.Debugf("job %d failed: %+v", job.ID, data)
		case pb.JobStatus_Streaming:
			job.Log = append(job.Log, string(data.GetContent()))
		}
	}
}

// StopJobProcess gRPC.
func (w *Worker) StopJobProcess(job *Job) error {
	if job == nil {
		return nil
	}
	_, err := w.cli.StopJobProcess(context.TODO(), job.Task)
	return err
}

func (w *Worker) broadcastJobStatus(job *Job) {
	sub := path.Join("/subs", "jobs", fmt.Sprintf("%d", job.BuildID))
	event := map[string]interface{}{
		"build_id": job.BuildID,
		"job_id":   job.ID,
		"status":   job.Status,
	}
	if start, err := ptypes.Timestamp(job.Task.StartTime); err == nil {
		event["start_time"] = util.FormatTime(start)
	}
	if end, err := ptypes.Timestamp(job.Task.EndTime); err == nil {
		event["end_time"] = util.FormatTime(end)
	}
	w.ws.Broadcast(sub, event)
}
