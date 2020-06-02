package app

import (
	"context"
	"fmt"
	"path"
	"sync"

	"github.com/jkuri/abstruse/internal/pkg/scm"
	"github.com/jkuri/abstruse/internal/pkg/shared"
	"github.com/jkuri/abstruse/internal/server/db/model"
	"github.com/jkuri/abstruse/internal/server/db/repository"
	"github.com/jkuri/abstruse/internal/server/parser"
	"github.com/jkuri/abstruse/internal/server/websocket"
	jsoniter "github.com/json-iterator/go"
	"go.etcd.io/etcd/clientv3"
	"go.uber.org/zap"
)

// App represent main gRPC application and holds data
// for established worker connections.
type App struct {
	mu        sync.RWMutex
	opts      *Options
	workers   map[string]*Worker
	client    *clientv3.Client
	ws        *websocket.App
	logger    *zap.SugaredLogger
	Scheduler *Scheduler
	errch     chan error

	buildRepository repository.BuildRepository
	jobRepository   repository.JobRepository
	repoRepository  repository.RepoRepository
}

// NewApp returns new instance of App.
func NewApp(
	opts *Options,
	ws *websocket.App,
	rr repository.RepoRepository,
	jr repository.JobRepository,
	br repository.BuildRepository,
	logger *zap.Logger,
) (*App, error) {
	app := &App{
		opts:            opts,
		workers:         make(map[string]*Worker),
		ws:              ws,
		buildRepository: br,
		jobRepository:   jr,
		repoRepository:  rr,
		logger:          logger.With(zap.String("type", "app")).Sugar(),
		errch:           make(chan error),
	}
	app.Scheduler = NewScheduler(app, logger)

	return app, nil
}

// Start starts gRPC application.
func (app *App) Start(client *clientv3.Client) error {
	app.logger.Debugf("starting app")
	app.client = client

	go func() {
		if err := app.watchWorkers(); err != nil {
			app.errch <- err
		}
	}()

	go app.Scheduler.Start(app.client)

	return <-app.errch
}

// GetWorkers returns online workers.
func (app *App) GetWorkers() map[string]*Worker {
	return app.workers
}

// StartJob temp func.
func (app *App) StartJob() bool {
	repoID, userID, ref := 1, 1, "8e1c6452d4"

	repo, err := app.repoRepository.Find(uint(repoID), uint(userID))
	if err != nil {
		app.logger.Errorf("%v", err)
		return false
	}
	scm, err := scm.NewSCM(context.Background(), repo.Provider.Name, repo.Provider.URL, repo.Provider.AccessToken)
	if err != nil {
		app.logger.Errorf("%v", err)
		return false
	}
	commit, err := scm.FindCommit(repo.FullName, ref)
	if err != nil {
		app.logger.Errorf("%v", err)
		return false
	}
	// fmt.Printf("%+v\n", commit)
	content, err := scm.FindContent(repo.FullName, commit.Sha, ".abstruse.yml")
	if err != nil {
		app.logger.Errorf("%v", err)
		return false
	}
	config := parser.ConfigParser{Raw: string(content.Data)}
	if err := config.Parse(); err != nil {
		app.logger.Errorf("%v", err)
		return false
	}
	commandsJSON, err := jsoniter.Marshal(config.Commands)
	if err != nil {
		app.logger.Errorf("%v", err)
		return false
	}
	envJSON, err := jsoniter.Marshal(config.Env)
	if err != nil {
		app.logger.Errorf("%v", err)
		return false
	}
	// fmt.Printf("%v %v\n", config.Commands, config.Env)

	buildModel := model.Build{
		Branch:          "master",
		Commit:          commit.Sha,
		CommitMessage:   commit.Message,
		Config:          string(content.Data),
		AuthorLogin:     commit.Author.Login,
		AuthorName:      commit.Author.Name,
		AuthorEmail:     commit.Author.Email,
		AuthorAvatar:    commit.Author.Avatar,
		CommitterLogin:  commit.Committer.Name,
		CommitterName:   commit.Committer.Name,
		CommitterEmail:  commit.Committer.Email,
		CommitterAvatar: commit.Committer.Avatar,
		RepositoryID:    repo.ID,
	}
	build, err := app.buildRepository.Create(buildModel)
	if err != nil {
		app.logger.Errorf("%v", err)
		return false
	}
	jobModel := model.Job{
		Image:    config.Parsed.Image,
		Commands: string(commandsJSON),
		Env:      string(envJSON),
		BuildID:  build.ID,
	}
	job, err := app.jobRepository.Create(jobModel)
	if err != nil {
		app.logger.Errorf("%v", err)
		return false
	}
	fmt.Printf("%+v\n", job)

	// for i := 1; i <= 5; i++ {
	// 	go func(i int) {
	// 		job := &Job{
	// 			ID:      uint64(i),
	// 			BuildID: 1,
	// 			Task: &pb.JobTask{
	// 				Id:       uint64(i),
	// 				Priority: 1000,
	// 				Image:    "ubuntu:20.04",
	// 				Commands: []string{"ps aux", "ls -alh", "uptime", "echo hello"},
	// 			},
	// 		}
	// 		app.Scheduler.ScheduleJobTask(job)
	// 	}(i)
	// }
	return true
}

func (app *App) initWorker(worker *Worker) {
	if err := worker.run(); err != nil {
		key := path.Join(shared.ServicePrefix, shared.WorkerService, worker.ID)
		app.client.Delete(context.TODO(), key)
	}
}

func (app *App) getCapacity() (int32, int32) {
	var max, running int32
	app.mu.Lock()
	defer app.mu.Unlock()
	for _, w := range app.workers {
		max += w.Max
		running += w.Running
	}
	return max, running
}
