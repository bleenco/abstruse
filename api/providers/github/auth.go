package github

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/bleenco/abstruse/db"
	"github.com/google/go-github/github"
	"golang.org/x/oauth2"
)

// CheckAndAddIntegration checks credentials and adds integration into db if valid.
func CheckAndAddIntegration(url, accessToken, username, password string, userID int) (bool, error) {
	ok, data, err := authenticateIntegration(url, accessToken, username, password)

	if ok && err == nil {
		integration := &db.Integration{
			Provider:          "github",
			GithubUsername:    username,
			GithubPassword:    password,
			GithubAccessToken: accessToken,
			UserID:            userID,
			Data:              data,
		}

		if _, err := integration.Create(); err != nil {
			return false, err
		}

		return true, nil
	}

	return false, err
}

// CheckAndUpdateIntegration check credentials and updates JSON data.
func CheckAndUpdateIntegration(integrationID, userID int) (bool, error) {
	integration := &db.Integration{}
	i, err := integration.Find(integrationID, userID)
	if err != nil {
		return false, err
	}

	ok, data, err := authenticateIntegration(i.GithubURL, i.GithubAccessToken, i.GithubUsername, i.GithubPassword)

	if ok && err == nil {
		integration.Data = data
		if _, err := integration.Update(); err != nil {
			return false, err
		}

		return true, nil
	}

	return false, err
}

func authenticateIntegration(url, accessToken, username, password string) (bool, string, error) {
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
	} else {
		return false, "", errors.New("credentials not provided")
	}

	var client *github.Client
	if strings.Contains(url, "github.com") {
		client = github.NewClient(tc)
	} else {
		c, err := github.NewEnterpriseClient(url, url, tc)
		if err != nil {
			return false, "", err
		}
		client = c
	}

	user, _, err := client.Users.Get(ctx, "")
	if err != nil {
		return false, "", err
	}

	data, err := json.Marshal(user)
	if err != nil {
		return false, "", err
	}

	return true, string(data), nil
}
