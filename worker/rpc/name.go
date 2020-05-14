package rpc

import (
	"context"
	"io/ioutil"

	"github.com/golang/protobuf/ptypes/empty"
	"github.com/jkuri/abstruse/pkg/id"
	pb "github.com/jkuri/abstruse/proto"
)

// WorkerID returns worker id calculated from certificate.
func (s *Server) WorkerID(ctx context.Context, in *empty.Empty) (*pb.WorkerIDReply, error) {
	cert, err := ioutil.ReadFile(s.cert)
	if err != nil {
		return nil, err
	}
	wid := id.New(cert)
	return &pb.WorkerIDReply{Id: wid.String()}, nil
}
