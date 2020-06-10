package core

// Scheduler contains logic for scheduling jobs.
type Scheduler interface {
	// Schedule schedules job to be executed on worker.
	Schedule(Job) error

	// Start starts the scheduler.
	Start() error

	// Pause pauses the scheduler after current running
	// jobs are done.
	Pause() error

	// Resume unpauses the scheduler and continues with
	// execution of jobs.
	Resume() error

	// Cancel cancels scheduled or pending job.
	Cancel(uint) error
}
