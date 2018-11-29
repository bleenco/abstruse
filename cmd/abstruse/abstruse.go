package main

import (
	"log"
	"os"

	"github.com/bleenco/abstruse/server"
)

func main() {
	config := &server.AbstruseConfig{
		HTTPAddress:  "0.0.0.0:80",
		HTTPSAddress: "0.0.0.0:443",
		CertFile:     "/Users/jan/Dev/certs/local.test+4.pem",
		KeyFile:      "/Users/jan/Dev/certs/local.test+4-key.pem",
	}
	abstruse, _ := server.NewAbstruse(config)

	if err := abstruse.Run(); err != nil {
		log.Fatal(err)
	}

	os.Exit(0)
}
