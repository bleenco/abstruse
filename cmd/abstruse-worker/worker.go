package main

import (
	"fmt"
	"os"

	"github.com/bleenco/abstruse/logger"
	"github.com/bleenco/abstruse/worker"
)

func main() {
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

	cfg := &worker.GRPCClientConfig{
		Address:         "0.0.0.0:3330",
		Compress:        false,
		RootCertificate: "/Users/jan/Dev/certs/local.test+4.pem",
	}
	client, err := worker.NewGRPCClient(cfg, logger.NewLogger("", true, false))
	if err != nil {
		fatal(err)
	}
	defer client.Close()

	if err := client.Run(); err != nil {
		os.Exit(1)
	}

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
