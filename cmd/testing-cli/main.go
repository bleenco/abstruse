package main

import (
	"os"
	"time"

	"github.com/jkuri/abstruse/internal/pkg/log"
	"github.com/jkuri/abstruse/internal/pkg/queue"
	"github.com/jkuri/abstruse/internal/pkg/util"
	"github.com/jkuri/abstruse/internal/worker/etcd"
	jsoniter "github.com/json-iterator/go"
)

func main() {
	logger, err := log.New(&log.Options{Stdout: true})
	if err != nil {
		logger.Sugar().Fatalf("%+v\n", err)
	}
	client, err := etcd.NewClient("localhost:2379")
	if err != nil {
		logger.Sugar().Fatalf("%+v\n", err)
	}

	q := queue.NewQueue(client, logger)

	for i := 0; i < 10; i++ {
		data := map[string]interface{}{
			"id":         i,
			"created_at": util.FormatTime(time.Now()),
		}
		b, err := jsoniter.Marshal(data)
		if err != nil {
			logger.Sugar().Fatalf("%+v\n", err)
		}
		task := queue.NewTask(uint64(i), string(b))
		err = q.Enqueue(task)
		if err != nil {
			logger.Sugar().Fatalf("%+v\n", err)
		}
		logger.Sugar().Infof("item %d enqueued", task.GetID())
		time.Sleep(time.Millisecond * 1000)
	}

	os.Exit(0)
}
