package app

import (
	"context"
	"fmt"
	"io"

	pb "github.com/jkuri/abstruse/proto"
)

// JobProcess gRPC
func (w *Worker) JobProcess(job *pb.JobTask) error {
	stream, err := w.cli.JobProcess(context.Background(), job)
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
		if data.GetCode() == pb.JobStatus_Streaming {
			fmt.Printf("%s", string(data.GetContent()))
		}

		if data.GetCode() == pb.JobStatus_Passing {
			w.logger.Debugf("%+v", data)
		}
	}
}
