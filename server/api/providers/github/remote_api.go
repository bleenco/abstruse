package github

import (
	"context"

	"github.com/google/go-github/v27/github"
)

// FetchCommitData fetches GitHub repository commit data.
func FetchCommitData(url, accessToken, username, password, repo, sha string) (*github.RepositoryCommit, error) {
	client, err := getGitHubClient(url, accessToken, username, password)
	if err != nil {
		return nil, err
	}

	user, _, err := client.Users.Get(context.Background(), "")
	if err != nil {
		return nil, err
	}

	commit, _, err := client.Repositories.GetCommit(context.Background(), user.GetLogin(), repo, sha)
	if err != nil {
		return nil, err
	}

	return commit, nil
}
