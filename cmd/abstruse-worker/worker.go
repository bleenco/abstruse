package main

import (
	"fmt"
	"os"

	"github.com/bleenco/abstruse/logger"
	"github.com/bleenco/abstruse/worker"
)

func main() {
	logger := logger.NewLogger("", true, true)
	w, err := worker.NewWorker(logger)
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
