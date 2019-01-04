package worker

import (
	pb "github.com/bleenco/abstruse/proto"
)

// SendQueuedStatus sends job status queued to server.
func SendQueuedStatus(id, name string) error {
	task := &pb.JobStatus{
		Id:   id,
		Name: name,
		Code: pb.JobStatus_Queued,
	}

	return Client.JobProcessStream.Send(task)
}

// SendStoppedStatus sends job status stopped to server.
func SendStoppedStatus(id, name string) error {
	task := &pb.JobStatus{
		Id:   id,
		Name: name,
		Code: pb.JobStatus_Stopped,
	}

	return Client.JobProcessStream.Send(task)
}

// SendRunningStatus sends job status running to server.
func SendRunningStatus(id, name string) error {
	task := &pb.JobStatus{
		Id:   id,
		Name: name,
		Code: pb.JobStatus_Running,
	}

	return Client.JobProcessStream.Send(task)
}

// SendFailingStatus sends job status failing to server.
func SendFailingStatus(id, name string) error {
	task := &pb.JobStatus{
		Id:   id,
		Name: name,
		Code: pb.JobStatus_Failing,
	}

	return Client.JobProcessStream.Send(task)
}

// SendPassingStatus sends job status passing to server.
func SendPassingStatus(id, name string) error {
	task := &pb.JobStatus{
		Id:   id,
		Name: name,
		Code: pb.JobStatus_Passing,
	}

	return Client.JobProcessStream.Send(task)
}
