package github

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/google/go-github/v27/github"
	"github.com/bleenco/abstruse/server/db"
	"golang.org/x/oauth2"
)

func getGitHubClient(url, accessToken, username, password string) (*github.Client, error) {
	var tc *http.Client
	var client *github.Client

	if accessToken != "" {
		ts := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: accessToken})
		tc = oauth2.NewClient(context.Background(), ts)
	} else if username != "" && password != "" {
		tp := github.BasicAuthTransport{
			Username: strings.TrimSpace(username),
			Password: strings.TrimSpace(password),
		}
		tc = tp.Client()
	} else {
		return client, errors.New("credentials not provided")
	}

	if strings.Contains(url, "github.com") {
		client = github.NewClient(tc)
	} else {
		c, err := github.NewEnterpriseClient(url, url, tc)
		if err != nil {
			return client, err
		}
		client = c
	}

	return client, nil
}

func getIntegrationClientData(integrationID, userID int) (url, accessToken, username, password string, err error) {
	var i db.Integration
	integration, err := i.Find(integrationID, userID)
	if err == nil {
		url = integration.URL
		accessToken = integration.AccessToken
		username = integration.Username
		password = integration.Password
	}

	return url, accessToken, username, password, err
}
