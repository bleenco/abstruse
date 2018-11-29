package github

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/google/go-github/github"
	"golang.org/x/oauth2"
)

func CheckAccessTokenValidity(url, accessToken, username, password string) (bool, error) {
	ctx := context.Background()
	var tc *http.Client

	if accessToken != "" {
		ts := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: accessToken})
		tc = oauth2.NewClient(ctx, ts)
	} else if username != "" && password != "" {
		tp := github.BasicAuthTransport{
			Username: strings.TrimSpace(username),
			Password: strings.TrimSpace(password),
		}
		tc = tp.Client()
	}

	var client *github.Client
	if strings.Contains(url, "github.com") {
		client = github.NewClient(tc)
	} else {
		c, err := github.NewEnterpriseClient(url, url, tc)
		if err != nil {
			return false, err
		}
		client = c
	}

	user, _, err := client.Users.Get(ctx, "")
	if err != nil {
		return false, err
	}

	fmt.Printf("\n%v\n", github.Stringify(user))

	return true, nil
}
