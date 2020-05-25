package app

import (
	"github.com/golang/protobuf/ptypes/empty"
	pb "github.com/jkuri/abstruse/proto"
)

// WorkerCapacityStatus server.
func (app *App) WorkerCapacityStatus(in *empty.Empty, stream pb.Api_WorkerCapacityStatusServer) error {
	for {
		capacity := <-app.queue.capacitych
		if err := stream.Send(capacity); err != nil {
			return err
		}
	}
}
