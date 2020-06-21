package app

import (
	"context"
	"fmt"
	"strings"

	"github.com/jkuri/abstruse/pkg/auth"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/peer"
)

type contextKey int
type contextIP int

const (
	workerIdentifierKey contextKey = iota
	workerIP            contextIP  = iota
)

const errAuth = "invalid credentials from abstruse server connection, please verify that JWT secrets in configs are the same"

func (s *APIServer) unaryInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	server, ok := info.Server.(*APIServer)
	if !ok {
		return nil, fmt.Errorf("unable to cast server")
	}

	identifier, err := authenticate(ctx, server)
	if err != nil {
		s.logger.Errorf(errAuth)
		return nil, err
	}

	ctx = context.WithValue(ctx, workerIdentifierKey, identifier)

	return handler(ctx, req)
}

type apiServerStream struct {
	identifier string
	ip         string
	grpc.ServerStream
}

func (s apiServerStream) context() context.Context {
	c := context.WithValue(s.ServerStream.Context(), workerIdentifierKey, s.identifier)
	c = context.WithValue(c, workerIP, s.ip)
	return c
}

func (s *APIServer) streamInterceptor(srv interface{}, stream grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
	ctx := stream.Context()
	server, ok := srv.(*APIServer)
	if !ok {
		return fmt.Errorf("unable to cast server")
	}

	identifier, err := authenticate(ctx, server)
	if err != nil {
		s.logger.Errorf(errAuth)
		return err
	}

	api := apiServerStream{
		identifier:   identifier,
		ServerStream: stream,
	}

	if peer, ok := peer.FromContext(ctx); ok {
		api.ip = peer.Addr.String()
	}

	return handler(srv, api)
}

func authenticate(ctx context.Context, s *APIServer) (string, error) {
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		identifier := strings.Join(md["identifier"], "")
		jwt := strings.Join(md["jwt"], "")

		calcID, err := auth.GetWorkerIdentifierByJWT(jwt)
		if err != nil {
			return "", fmt.Errorf("invalid credentials")
		}

		if calcID == identifier {
			return identifier, nil
		}

		return "", fmt.Errorf("invalid credentials")
	}
	return "", fmt.Errorf("missing credentials")
}
