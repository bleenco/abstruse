package github

import (
	"context"

	"github.com/google/go-github/v27/github"
	"github.com/bleenco/abstruse/server/db"
)

// CheckAndAddIntegration checks credentials and adds integration into db if valid.
func CheckAndAddIntegration(url, accessToken, username, password string, userID int) (bool, error) {
	ok, err := AuthenticateIntegration(url, accessToken, username, password)

	if ok && err == nil {
		integration := &db.Integration{
			Provider:    "github",
			Username:    username,
			Password:    password,
			AccessToken: accessToken,
			UserID:      userID,
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

	ok, err := AuthenticateIntegration(i.URL, i.AccessToken, i.Username, i.Password)

	if ok && err == nil {
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
func AuthenticateIntegration(url, accessToken, username, password string) (bool, error) {
	client, err := getGitHubClient(url, accessToken, username, password)
	if err != nil {
		return false, err
	}

	_, _, err = client.Users.Get(context.Background(), "")
	if err != nil {
		return false, err
	}

	return true, nil
}
