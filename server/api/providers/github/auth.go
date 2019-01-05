package github

import (
	"context"
	"encoding/json"

	"github.com/bleenco/abstruse/server/db"
	"github.com/google/go-github/github"
)

// CheckAndAddIntegration checks credentials and adds integration into db if valid.
func CheckAndAddIntegration(url, accessToken, username, password string, userID int) (bool, error) {
	ok, data, err := AuthenticateIntegration(url, accessToken, username, password)

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

	ok, data, err := AuthenticateIntegration(i.GithubURL, i.GithubAccessToken, i.GithubUsername, i.GithubPassword)

	if ok && err == nil {
		integration.Data = data
		if _, err := integration.Update(); err != nil {
			return false, err
		}

		return true, nil
	}

	return false, err
}

// FetchIntegrationRepositories fetches all repositories for GitHub provider.
func FetchIntegrationRepositories(url, accessToken, username, password string) ([]*github.Repository, error) {
	var repositories []*github.Repository

	client, err := getGitHubClient(url, accessToken, username, password)
	if err != nil {
		return repositories, err
	}

	user, _, err := client.Users.Get(context.Background(), "")
	if err != nil {
		return repositories, err
	}

	repositories, _, err = client.Repositories.List(context.Background(), *user.Login, nil)
	if err != nil {
		return repositories, err
	}

	return repositories, nil
}

// AuthenticateIntegration returns boolean if auth is ok and response data.
func AuthenticateIntegration(url, accessToken, username, password string) (bool, string, error) {
	client, err := getGitHubClient(url, accessToken, username, password)
	if err != nil {
		return false, "", err
	}

	user, _, err := client.Users.Get(context.Background(), "")
	if err != nil {
		return false, "", err
	}

	data, err := json.Marshal(user)
	if err != nil {
		return false, "", err
	}

	return true, string(data), nil
}
