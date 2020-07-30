package main

import (
	"bufio"
	"bytes"
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

var (
	target  = flag.String("target", "http://localhost/webhooks", "target url")
	method  = flag.String("method", "POST", "http method")
	dirPath = flag.String("dir", "", "path to directory containing headers and body data")
)

func main() {
	flag.Parse()

	if *dirPath == "" {
		os.Exit(1)
	}

	payload, err := ioutil.ReadFile(filepath.Join(*dirPath, "webhook.json"))
	if err != nil {
		fatal(err)
	}

	timeout := time.Duration(5 * time.Second)
	client := http.Client{Timeout: timeout}
	request, err := http.NewRequest(*method, *target, bytes.NewBuffer(payload))
	if err != nil {
		fatal(err)
	}

	headersFile, err := os.Open(filepath.Join(*dirPath, "headers.txt"))
	if err != nil {
		fatal(err)
	}
	reader := bufio.NewReader(headersFile)
	for {
		var buf bytes.Buffer
		var l []byte
		var isPrefix bool
		for {
			l, isPrefix, err = reader.ReadLine()
			buf.Write(l)
			if !isPrefix {
				break
			}
			if err != nil {
				break
			}
		}

		if err == io.EOF {
			break
		}

		line := buf.String()
		splitted := strings.Split(line, " ")
		request.Header.Set(splitted[0], splitted[1])
	}
	headersFile.Close()

	resp, err := client.Do(request)
	if err != nil {
		fatal(err)
	}
	fmt.Printf("status: %d\n", resp.StatusCode)
	os.Exit(0)
}

func fatal(msg interface{}) {
	fmt.Println(msg)
	os.Exit(1)
}
