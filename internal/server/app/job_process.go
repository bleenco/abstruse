package app

import (
	"context"
	"io"

	"github.com/golang/protobuf/ptypes"
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
	for {
		data, err := stream.Recv()
		if err != nil {
			if err == io.EOF {
				return nil
			}
			return err
		}

		switch code := data.GetCode(); code {
		case pb.JobStatus_Passing:
			job.Status = "passing"
			job.Task.EndTime = ptypes.TimestampNow()
			if err := w.app.saveJob(job); err != nil {
				return err
			}
			w.logger.Debugf("job %d passing: %+v", job.ID, data)
		case pb.JobStatus_Failing:
			job.Status = "failing"
			job.Task.EndTime = ptypes.TimestampNow()
			if err := w.app.saveJob(job); err != nil {
				return err
			}
			w.logger.Debugf("job %d failed: %+v", job.ID, data)
		case pb.JobStatus_Running:
			job.Log = append(job.Log, string(data.GetContent()))
		}
	}
}
