package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/bleenco/abstruse/pkg/logger"
	"github.com/bleenco/abstruse/worker"
)

var (
	configPath = flag.String("configPath", "", "path to abstruse worker config.json")
	debug      = flag.Bool("debug", true, "debug mode")
)

func main() {
	flag.Parse()

	logger := logger.NewLogger("worker", true, *debug)
	w, err := worker.NewWorker(logger, *configPath)
	if err != nil {
		fatal(err)
	}

	if err := w.Run(); err != nil {
		fatal(err)
	}

	os.Exit(0)
}

func fatal(err error) {
	fmt.Printf("%+v", err)
	os.Exit(1)
}
