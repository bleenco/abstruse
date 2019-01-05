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

	// url := "https://github.com/jkuri/d3-bundle.git"

	// if err := git.TestClone(url); err != nil {
	// 	fmt.Printf("%+v", err)
	// 	os.Exit(1)
	// }

	// contents, err := git.FetchAbstruseConfig(url)
	// if err != nil {
	// 	fmt.Printf("%+v", err)
	// 	os.Exit(1)
	// }

	// fmt.Println(contents)

	// if err := worker.RunContainer(); err != nil {
	// 	fatal(err)
	// }

	// file := "/Users/jan/Documents/abstruse.sqlite"
	// stat, err := client.UploadFile(context.Background(), file)
	// if err != nil {
	// 	fatal(err)
	// }

	// fmt.Printf("%s\n", humanize.Bytes(uint64(stat.BytesSent)))

	os.Exit(0)
}

func fatal(err error) {
	fmt.Printf("%+v", err)
	os.Exit(1)
}
