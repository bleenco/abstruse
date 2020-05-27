package app

import (
	"context"
	"io"

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
		if data.GetCode() == pb.JobStatus_Running {
			job.Log = append(job.Log, string(data.GetContent()))
		}

		switch code := data.GetCode(); code {
		case pb.JobStatus_Passing:
			w.logger.Debugf("job passing: %+v", data)
		case pb.JobStatus_Failing:
			w.logger.Debugf("job failed: %+v", data)
		}
	}
}
