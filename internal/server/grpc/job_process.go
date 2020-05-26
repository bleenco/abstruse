package grpc

import (
	"context"
	"io"

	pb "github.com/jkuri/abstruse/proto"
)

// JobProcess gRPC
func (w *Worker) JobProcess(j *pb.JobTask) error {
	stream, err := w.cli.JobProcess(context.Background(), j)
	if err != nil {
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
		if data.GetCode() == pb.JobStatus_Passing {
			w.logger.Debugf("%+v", data)
		}
	}
}
