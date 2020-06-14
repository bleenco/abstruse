package service

import (
	"bytes"
	"context"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/jkuri/abstruse/internal/pkg/scm"
	"github.com/jkuri/abstruse/internal/server/db/repository"
	jsoniter "github.com/json-iterator/go"
)

var (
	githubHeaders    = []string{"X-GitHub-Delivery", "X-GitHub-Event", "X-Hub-Signature"}
	gitlabHeaders    = []string{"X-Gitlab-Event", "X-Gitlab-Token"}
	giteaHeaders     = []string{"X-Gitea-Delivery", "X-Gitea-Event", "X-Gitea-Signature"}
	gogsHeaders      = []string{"X-Gogs-Delivery", "X-Gogs-Event", "X-Gogs-Signature"}
	bitbucketHeaders = []string{"X-Request-Id", "X-Event-Key", "X-Hub-Signature"}
)

// HookService interface
type HookService interface {
	DetectWebhook(req *http.Request) (*scm.SCM, error)
}

// DefaultHookService struct
type DefaultHookService struct {
	repository repository.RepoRepository
}

// NewHookService returns new instance of HookService
func NewHookService(repository repository.RepoRepository) HookService {
	return &DefaultHookService{repository}
}

// DetectWebhook tries to detect provider based on webhook payload and headers.
func (s *DefaultHookService) DetectWebhook(req *http.Request) (*scm.SCM, error) {
	headers := req.Header.Clone()
	data, err := ioutil.ReadAll(req.Body)
	if err != nil {
		return nil, err
	}
	req.Body.Close()
	req.Body = ioutil.NopCloser(bytes.NewBuffer(data))

	if url, ok := detectGitea(headers, data); ok {
		repo, err := s.repository.FindByURL(url)
		if err != nil {
			return nil, err
		}
		return scm.NewSCM(context.Background(), repo.Provider.Name, repo.URL, repo.Provider.AccessToken)
	}
	if url, ok := detectGithub(headers, data); ok {
		repo, err := s.repository.FindByURL(url)
		if err != nil {
			return nil, err
		}
		return scm.NewSCM(context.Background(), repo.Provider.Name, repo.URL, repo.Provider.AccessToken)
	}
	if url, ok := detectGitlab(headers, data); ok {
		repo, err := s.repository.FindByURL(url)
		if err != nil {
			return nil, err
		}
		return scm.NewSCM(context.Background(), repo.Provider.Name, repo.URL, repo.Provider.AccessToken)
	}
	if url, ok := detectGogs(headers, data); ok {
		repo, err := s.repository.FindByURL(url)
		if err != nil {
			return nil, err
		}
		return scm.NewSCM(context.Background(), repo.Provider.Name, repo.URL, repo.Provider.AccessToken)
	}

	return nil, fmt.Errorf("not implemented")
}

func detectGithub(header http.Header, body []byte) (string, bool) {
	if !hasHeaders(header, githubHeaders) {
		return "", false
	}
	var pushRequest githubPushPayload
	if err := jsoniter.Unmarshal(body, &pushRequest); err == nil {
		if pushRequest.Repository.GitURL != "" {
			return pushRequest.Repository.GitURL, true
		}
	}
	var pullRequest githubPullRequestPayload
	if err := jsoniter.Unmarshal(body, &pullRequest); err == nil {
		if pullRequest.Repository.GitURL != "" {
			return pullRequest.Repository.GitURL, true
		}
	}
	return "", false
}

func detectGitlab(header http.Header, body []byte) (string, bool) {
	if !hasHeaders(header, gitlabHeaders) {
		return "", false
	}
	var pushRequest gitlabPushPayload
	if err := jsoniter.Unmarshal(body, &pushRequest); err == nil {
		if pushRequest.Repository.GitHTTPURL != "" {
			return pushRequest.Repository.GitHTTPURL, true
		}
	}
	var pullRequest gitlabPullRequestPayload
	if err := jsoniter.Unmarshal(body, &pullRequest); err == nil {
		if pullRequest.Repository.URL != "" {
			return pullRequest.Repository.URL, true
		}
	}
	return "", false
}

func detectGitea(header http.Header, body []byte) (string, bool) {
	if !hasHeaders(header, giteaHeaders) {
		return "", false
	}
	var pushRequest giteaPushPayload
	if err := jsoniter.Unmarshal(body, &pushRequest); err == nil {
		if pushRequest.Repository.CloneURL != "" {
			return pushRequest.Repository.CloneURL, true
		}
	}
	var pullRequest giteaPullRequestPayload
	if err := jsoniter.Unmarshal(body, &pullRequest); err == nil {
		if pullRequest.Repository.CloneURL != "" {
			return pullRequest.Repository.CloneURL, true
		}
	}
	return "", false
}

func detectGogs(header http.Header, body []byte) (string, bool) {
	if !hasHeaders(header, gogsHeaders) {
		return "", false
	}
	var pushRequest giteaPushPayload
	if err := jsoniter.Unmarshal(body, &pushRequest); err == nil {
		if pushRequest.Repository.HTMLURL != "" {
			return pushRequest.Repository.CloneURL, true
		}
	}
	var pullRequest giteaPullRequestPayload
	if err := jsoniter.Unmarshal(body, &pullRequest); err == nil {
		if pullRequest.Repository.HTMLURL != "" {
			return pullRequest.Repository.CloneURL, true
		}
	}
	return "", false
}

func hasHeaders(header http.Header, keys []string) bool {
	for _, key := range keys {
		if header.Get(key) == "" {
			return false
		}
	}
	return true
}

type (
	githubPushPayload struct {
		Ref        string        `json:"ref"`
		Before     string        `json:"before"`
		After      string        `json:"after"`
		Created    bool          `json:"created"`
		Deleted    bool          `json:"deleted"`
		Forced     bool          `json:"forced"`
		BaseRef    interface{}   `json:"base_ref"`
		Compare    string        `json:"compare"`
		Commits    []interface{} `json:"commits"`
		HeadCommit interface{}   `json:"head_commit"`
		Repository struct {
			ID       int    `json:"id"`
			NodeID   string `json:"node_id"`
			Name     string `json:"name"`
			FullName string `json:"full_name"`
			Private  bool   `json:"private"`
			Owner    struct {
				Name              string `json:"name"`
				Email             string `json:"email"`
				Login             string `json:"login"`
				ID                int    `json:"id"`
				NodeID            string `json:"node_id"`
				AvatarURL         string `json:"avatar_url"`
				GravatarID        string `json:"gravatar_id"`
				URL               string `json:"url"`
				HTMLURL           string `json:"html_url"`
				FollowersURL      string `json:"followers_url"`
				FollowingURL      string `json:"following_url"`
				GistsURL          string `json:"gists_url"`
				StarredURL        string `json:"starred_url"`
				SubscriptionsURL  string `json:"subscriptions_url"`
				OrganizationsURL  string `json:"organizations_url"`
				ReposURL          string `json:"repos_url"`
				EventsURL         string `json:"events_url"`
				ReceivedEventsURL string `json:"received_events_url"`
				Type              string `json:"type"`
				SiteAdmin         bool   `json:"site_admin"`
			} `json:"owner"`
			HTMLURL          string      `json:"html_url"`
			Description      interface{} `json:"description"`
			Fork             bool        `json:"fork"`
			URL              string      `json:"url"`
			ForksURL         string      `json:"forks_url"`
			KeysURL          string      `json:"keys_url"`
			CollaboratorsURL string      `json:"collaborators_url"`
			TeamsURL         string      `json:"teams_url"`
			HooksURL         string      `json:"hooks_url"`
			IssueEventsURL   string      `json:"issue_events_url"`
			EventsURL        string      `json:"events_url"`
			AssigneesURL     string      `json:"assignees_url"`
			BranchesURL      string      `json:"branches_url"`
			TagsURL          string      `json:"tags_url"`
			BlobsURL         string      `json:"blobs_url"`
			GitTagsURL       string      `json:"git_tags_url"`
			GitRefsURL       string      `json:"git_refs_url"`
			TreesURL         string      `json:"trees_url"`
			StatusesURL      string      `json:"statuses_url"`
			LanguagesURL     string      `json:"languages_url"`
			StargazersURL    string      `json:"stargazers_url"`
			ContributorsURL  string      `json:"contributors_url"`
			SubscribersURL   string      `json:"subscribers_url"`
			SubscriptionURL  string      `json:"subscription_url"`
			CommitsURL       string      `json:"commits_url"`
			GitCommitsURL    string      `json:"git_commits_url"`
			CommentsURL      string      `json:"comments_url"`
			IssueCommentURL  string      `json:"issue_comment_url"`
			ContentsURL      string      `json:"contents_url"`
			CompareURL       string      `json:"compare_url"`
			MergesURL        string      `json:"merges_url"`
			ArchiveURL       string      `json:"archive_url"`
			DownloadsURL     string      `json:"downloads_url"`
			IssuesURL        string      `json:"issues_url"`
			PullsURL         string      `json:"pulls_url"`
			MilestonesURL    string      `json:"milestones_url"`
			NotificationsURL string      `json:"notifications_url"`
			LabelsURL        string      `json:"labels_url"`
			ReleasesURL      string      `json:"releases_url"`
			DeploymentsURL   string      `json:"deployments_url"`
			CreatedAt        int         `json:"created_at"`
			UpdatedAt        time.Time   `json:"updated_at"`
			PushedAt         int         `json:"pushed_at"`
			GitURL           string      `json:"git_url"`
			SSHURL           string      `json:"ssh_url"`
			CloneURL         string      `json:"clone_url"`
			SvnURL           string      `json:"svn_url"`
			Homepage         interface{} `json:"homepage"`
			Size             int         `json:"size"`
			StargazersCount  int         `json:"stargazers_count"`
			WatchersCount    int         `json:"watchers_count"`
			Language         string      `json:"language"`
			HasIssues        bool        `json:"has_issues"`
			HasProjects      bool        `json:"has_projects"`
			HasDownloads     bool        `json:"has_downloads"`
			HasWiki          bool        `json:"has_wiki"`
			HasPages         bool        `json:"has_pages"`
			ForksCount       int         `json:"forks_count"`
			MirrorURL        interface{} `json:"mirror_url"`
			Archived         bool        `json:"archived"`
			Disabled         bool        `json:"disabled"`
			OpenIssuesCount  int         `json:"open_issues_count"`
			License          interface{} `json:"license"`
			Forks            int         `json:"forks"`
			OpenIssues       int         `json:"open_issues"`
			Watchers         int         `json:"watchers"`
			DefaultBranch    string      `json:"default_branch"`
			Stargazers       int         `json:"stargazers"`
			MasterBranch     string      `json:"master_branch"`
		} `json:"repository"`
		Pusher struct {
			Name  string `json:"name"`
			Email string `json:"email"`
		} `json:"pusher"`
		Sender struct {
			Login             string `json:"login"`
			ID                int    `json:"id"`
			NodeID            string `json:"node_id"`
			AvatarURL         string `json:"avatar_url"`
			GravatarID        string `json:"gravatar_id"`
			URL               string `json:"url"`
			HTMLURL           string `json:"html_url"`
			FollowersURL      string `json:"followers_url"`
			FollowingURL      string `json:"following_url"`
			GistsURL          string `json:"gists_url"`
			StarredURL        string `json:"starred_url"`
			SubscriptionsURL  string `json:"subscriptions_url"`
			OrganizationsURL  string `json:"organizations_url"`
			ReposURL          string `json:"repos_url"`
			EventsURL         string `json:"events_url"`
			ReceivedEventsURL string `json:"received_events_url"`
			Type              string `json:"type"`
			SiteAdmin         bool   `json:"site_admin"`
		} `json:"sender"`
	}

	githubPullRequestPayload struct {
		Action      string `json:"action"`
		Number      int    `json:"number"`
		PullRequest struct {
			URL      string `json:"url"`
			ID       int    `json:"id"`
			NodeID   string `json:"node_id"`
			HTMLURL  string `json:"html_url"`
			DiffURL  string `json:"diff_url"`
			PatchURL string `json:"patch_url"`
			IssueURL string `json:"issue_url"`
			Number   int    `json:"number"`
			State    string `json:"state"`
			Locked   bool   `json:"locked"`
			Title    string `json:"title"`
			User     struct {
				Login             string `json:"login"`
				ID                int    `json:"id"`
				NodeID            string `json:"node_id"`
				AvatarURL         string `json:"avatar_url"`
				GravatarID        string `json:"gravatar_id"`
				URL               string `json:"url"`
				HTMLURL           string `json:"html_url"`
				FollowersURL      string `json:"followers_url"`
				FollowingURL      string `json:"following_url"`
				GistsURL          string `json:"gists_url"`
				StarredURL        string `json:"starred_url"`
				SubscriptionsURL  string `json:"subscriptions_url"`
				OrganizationsURL  string `json:"organizations_url"`
				ReposURL          string `json:"repos_url"`
				EventsURL         string `json:"events_url"`
				ReceivedEventsURL string `json:"received_events_url"`
				Type              string `json:"type"`
				SiteAdmin         bool   `json:"site_admin"`
			} `json:"user"`
			Body               string        `json:"body"`
			CreatedAt          time.Time     `json:"created_at"`
			UpdatedAt          time.Time     `json:"updated_at"`
			ClosedAt           interface{}   `json:"closed_at"`
			MergedAt           interface{}   `json:"merged_at"`
			MergeCommitSha     interface{}   `json:"merge_commit_sha"`
			Assignee           interface{}   `json:"assignee"`
			Assignees          []interface{} `json:"assignees"`
			RequestedReviewers []interface{} `json:"requested_reviewers"`
			RequestedTeams     []interface{} `json:"requested_teams"`
			Labels             []interface{} `json:"labels"`
			Milestone          interface{}   `json:"milestone"`
			CommitsURL         string        `json:"commits_url"`
			ReviewCommentsURL  string        `json:"review_comments_url"`
			ReviewCommentURL   string        `json:"review_comment_url"`
			CommentsURL        string        `json:"comments_url"`
			StatusesURL        string        `json:"statuses_url"`
			Head               struct {
				Label string `json:"label"`
				Ref   string `json:"ref"`
				Sha   string `json:"sha"`
				User  struct {
					Login             string `json:"login"`
					ID                int    `json:"id"`
					NodeID            string `json:"node_id"`
					AvatarURL         string `json:"avatar_url"`
					GravatarID        string `json:"gravatar_id"`
					URL               string `json:"url"`
					HTMLURL           string `json:"html_url"`
					FollowersURL      string `json:"followers_url"`
					FollowingURL      string `json:"following_url"`
					GistsURL          string `json:"gists_url"`
					StarredURL        string `json:"starred_url"`
					SubscriptionsURL  string `json:"subscriptions_url"`
					OrganizationsURL  string `json:"organizations_url"`
					ReposURL          string `json:"repos_url"`
					EventsURL         string `json:"events_url"`
					ReceivedEventsURL string `json:"received_events_url"`
					Type              string `json:"type"`
					SiteAdmin         bool   `json:"site_admin"`
				} `json:"user"`
				Repo struct {
					ID       int    `json:"id"`
					NodeID   string `json:"node_id"`
					Name     string `json:"name"`
					FullName string `json:"full_name"`
					Private  bool   `json:"private"`
					Owner    struct {
						Login             string `json:"login"`
						ID                int    `json:"id"`
						NodeID            string `json:"node_id"`
						AvatarURL         string `json:"avatar_url"`
						GravatarID        string `json:"gravatar_id"`
						URL               string `json:"url"`
						HTMLURL           string `json:"html_url"`
						FollowersURL      string `json:"followers_url"`
						FollowingURL      string `json:"following_url"`
						GistsURL          string `json:"gists_url"`
						StarredURL        string `json:"starred_url"`
						SubscriptionsURL  string `json:"subscriptions_url"`
						OrganizationsURL  string `json:"organizations_url"`
						ReposURL          string `json:"repos_url"`
						EventsURL         string `json:"events_url"`
						ReceivedEventsURL string `json:"received_events_url"`
						Type              string `json:"type"`
						SiteAdmin         bool   `json:"site_admin"`
					} `json:"owner"`
					HTMLURL          string      `json:"html_url"`
					Description      interface{} `json:"description"`
					Fork             bool        `json:"fork"`
					URL              string      `json:"url"`
					ForksURL         string      `json:"forks_url"`
					KeysURL          string      `json:"keys_url"`
					CollaboratorsURL string      `json:"collaborators_url"`
					TeamsURL         string      `json:"teams_url"`
					HooksURL         string      `json:"hooks_url"`
					IssueEventsURL   string      `json:"issue_events_url"`
					EventsURL        string      `json:"events_url"`
					AssigneesURL     string      `json:"assignees_url"`
					BranchesURL      string      `json:"branches_url"`
					TagsURL          string      `json:"tags_url"`
					BlobsURL         string      `json:"blobs_url"`
					GitTagsURL       string      `json:"git_tags_url"`
					GitRefsURL       string      `json:"git_refs_url"`
					TreesURL         string      `json:"trees_url"`
					StatusesURL      string      `json:"statuses_url"`
					LanguagesURL     string      `json:"languages_url"`
					StargazersURL    string      `json:"stargazers_url"`
					ContributorsURL  string      `json:"contributors_url"`
					SubscribersURL   string      `json:"subscribers_url"`
					SubscriptionURL  string      `json:"subscription_url"`
					CommitsURL       string      `json:"commits_url"`
					GitCommitsURL    string      `json:"git_commits_url"`
					CommentsURL      string      `json:"comments_url"`
					IssueCommentURL  string      `json:"issue_comment_url"`
					ContentsURL      string      `json:"contents_url"`
					CompareURL       string      `json:"compare_url"`
					MergesURL        string      `json:"merges_url"`
					ArchiveURL       string      `json:"archive_url"`
					DownloadsURL     string      `json:"downloads_url"`
					IssuesURL        string      `json:"issues_url"`
					PullsURL         string      `json:"pulls_url"`
					MilestonesURL    string      `json:"milestones_url"`
					NotificationsURL string      `json:"notifications_url"`
					LabelsURL        string      `json:"labels_url"`
					ReleasesURL      string      `json:"releases_url"`
					DeploymentsURL   string      `json:"deployments_url"`
					CreatedAt        time.Time   `json:"created_at"`
					UpdatedAt        time.Time   `json:"updated_at"`
					PushedAt         time.Time   `json:"pushed_at"`
					GitURL           string      `json:"git_url"`
					SSHURL           string      `json:"ssh_url"`
					CloneURL         string      `json:"clone_url"`
					SvnURL           string      `json:"svn_url"`
					Homepage         interface{} `json:"homepage"`
					Size             int         `json:"size"`
					StargazersCount  int         `json:"stargazers_count"`
					WatchersCount    int         `json:"watchers_count"`
					Language         interface{} `json:"language"`
					HasIssues        bool        `json:"has_issues"`
					HasProjects      bool        `json:"has_projects"`
					HasDownloads     bool        `json:"has_downloads"`
					HasWiki          bool        `json:"has_wiki"`
					HasPages         bool        `json:"has_pages"`
					ForksCount       int         `json:"forks_count"`
					MirrorURL        interface{} `json:"mirror_url"`
					Archived         bool        `json:"archived"`
					Disabled         bool        `json:"disabled"`
					OpenIssuesCount  int         `json:"open_issues_count"`
					License          interface{} `json:"license"`
					Forks            int         `json:"forks"`
					OpenIssues       int         `json:"open_issues"`
					Watchers         int         `json:"watchers"`
					DefaultBranch    string      `json:"default_branch"`
				} `json:"repo"`
			} `json:"head"`
			Base struct {
				Label string `json:"label"`
				Ref   string `json:"ref"`
				Sha   string `json:"sha"`
				User  struct {
					Login             string `json:"login"`
					ID                int    `json:"id"`
					NodeID            string `json:"node_id"`
					AvatarURL         string `json:"avatar_url"`
					GravatarID        string `json:"gravatar_id"`
					URL               string `json:"url"`
					HTMLURL           string `json:"html_url"`
					FollowersURL      string `json:"followers_url"`
					FollowingURL      string `json:"following_url"`
					GistsURL          string `json:"gists_url"`
					StarredURL        string `json:"starred_url"`
					SubscriptionsURL  string `json:"subscriptions_url"`
					OrganizationsURL  string `json:"organizations_url"`
					ReposURL          string `json:"repos_url"`
					EventsURL         string `json:"events_url"`
					ReceivedEventsURL string `json:"received_events_url"`
					Type              string `json:"type"`
					SiteAdmin         bool   `json:"site_admin"`
				} `json:"user"`
				Repo struct {
					ID       int    `json:"id"`
					NodeID   string `json:"node_id"`
					Name     string `json:"name"`
					FullName string `json:"full_name"`
					Private  bool   `json:"private"`
					Owner    struct {
						Login             string `json:"login"`
						ID                int    `json:"id"`
						NodeID            string `json:"node_id"`
						AvatarURL         string `json:"avatar_url"`
						GravatarID        string `json:"gravatar_id"`
						URL               string `json:"url"`
						HTMLURL           string `json:"html_url"`
						FollowersURL      string `json:"followers_url"`
						FollowingURL      string `json:"following_url"`
						GistsURL          string `json:"gists_url"`
						StarredURL        string `json:"starred_url"`
						SubscriptionsURL  string `json:"subscriptions_url"`
						OrganizationsURL  string `json:"organizations_url"`
						ReposURL          string `json:"repos_url"`
						EventsURL         string `json:"events_url"`
						ReceivedEventsURL string `json:"received_events_url"`
						Type              string `json:"type"`
						SiteAdmin         bool   `json:"site_admin"`
					} `json:"owner"`
					HTMLURL          string      `json:"html_url"`
					Description      interface{} `json:"description"`
					Fork             bool        `json:"fork"`
					URL              string      `json:"url"`
					ForksURL         string      `json:"forks_url"`
					KeysURL          string      `json:"keys_url"`
					CollaboratorsURL string      `json:"collaborators_url"`
					TeamsURL         string      `json:"teams_url"`
					HooksURL         string      `json:"hooks_url"`
					IssueEventsURL   string      `json:"issue_events_url"`
					EventsURL        string      `json:"events_url"`
					AssigneesURL     string      `json:"assignees_url"`
					BranchesURL      string      `json:"branches_url"`
					TagsURL          string      `json:"tags_url"`
					BlobsURL         string      `json:"blobs_url"`
					GitTagsURL       string      `json:"git_tags_url"`
					GitRefsURL       string      `json:"git_refs_url"`
					TreesURL         string      `json:"trees_url"`
					StatusesURL      string      `json:"statuses_url"`
					LanguagesURL     string      `json:"languages_url"`
					StargazersURL    string      `json:"stargazers_url"`
					ContributorsURL  string      `json:"contributors_url"`
					SubscribersURL   string      `json:"subscribers_url"`
					SubscriptionURL  string      `json:"subscription_url"`
					CommitsURL       string      `json:"commits_url"`
					GitCommitsURL    string      `json:"git_commits_url"`
					CommentsURL      string      `json:"comments_url"`
					IssueCommentURL  string      `json:"issue_comment_url"`
					ContentsURL      string      `json:"contents_url"`
					CompareURL       string      `json:"compare_url"`
					MergesURL        string      `json:"merges_url"`
					ArchiveURL       string      `json:"archive_url"`
					DownloadsURL     string      `json:"downloads_url"`
					IssuesURL        string      `json:"issues_url"`
					PullsURL         string      `json:"pulls_url"`
					MilestonesURL    string      `json:"milestones_url"`
					NotificationsURL string      `json:"notifications_url"`
					LabelsURL        string      `json:"labels_url"`
					ReleasesURL      string      `json:"releases_url"`
					DeploymentsURL   string      `json:"deployments_url"`
					CreatedAt        time.Time   `json:"created_at"`
					UpdatedAt        time.Time   `json:"updated_at"`
					PushedAt         time.Time   `json:"pushed_at"`
					GitURL           string      `json:"git_url"`
					SSHURL           string      `json:"ssh_url"`
					CloneURL         string      `json:"clone_url"`
					SvnURL           string      `json:"svn_url"`
					Homepage         interface{} `json:"homepage"`
					Size             int         `json:"size"`
					StargazersCount  int         `json:"stargazers_count"`
					WatchersCount    int         `json:"watchers_count"`
					Language         interface{} `json:"language"`
					HasIssues        bool        `json:"has_issues"`
					HasProjects      bool        `json:"has_projects"`
					HasDownloads     bool        `json:"has_downloads"`
					HasWiki          bool        `json:"has_wiki"`
					HasPages         bool        `json:"has_pages"`
					ForksCount       int         `json:"forks_count"`
					MirrorURL        interface{} `json:"mirror_url"`
					Archived         bool        `json:"archived"`
					Disabled         bool        `json:"disabled"`
					OpenIssuesCount  int         `json:"open_issues_count"`
					License          interface{} `json:"license"`
					Forks            int         `json:"forks"`
					OpenIssues       int         `json:"open_issues"`
					Watchers         int         `json:"watchers"`
					DefaultBranch    string      `json:"default_branch"`
				} `json:"repo"`
			} `json:"base"`
			Links struct {
				Self struct {
					Href string `json:"href"`
				} `json:"self"`
				HTML struct {
					Href string `json:"href"`
				} `json:"html"`
				Issue struct {
					Href string `json:"href"`
				} `json:"issue"`
				Comments struct {
					Href string `json:"href"`
				} `json:"comments"`
				ReviewComments struct {
					Href string `json:"href"`
				} `json:"review_comments"`
				ReviewComment struct {
					Href string `json:"href"`
				} `json:"review_comment"`
				Commits struct {
					Href string `json:"href"`
				} `json:"commits"`
				Statuses struct {
					Href string `json:"href"`
				} `json:"statuses"`
			} `json:"_links"`
			AuthorAssociation   string      `json:"author_association"`
			Draft               bool        `json:"draft"`
			Merged              bool        `json:"merged"`
			Mergeable           interface{} `json:"mergeable"`
			Rebaseable          interface{} `json:"rebaseable"`
			MergeableState      string      `json:"mergeable_state"`
			MergedBy            interface{} `json:"merged_by"`
			Comments            int         `json:"comments"`
			ReviewComments      int         `json:"review_comments"`
			MaintainerCanModify bool        `json:"maintainer_can_modify"`
			Commits             int         `json:"commits"`
			Additions           int         `json:"additions"`
			Deletions           int         `json:"deletions"`
			ChangedFiles        int         `json:"changed_files"`
		} `json:"pull_request"`
		Repository struct {
			ID       int    `json:"id"`
			NodeID   string `json:"node_id"`
			Name     string `json:"name"`
			FullName string `json:"full_name"`
			Private  bool   `json:"private"`
			Owner    struct {
				Login             string `json:"login"`
				ID                int    `json:"id"`
				NodeID            string `json:"node_id"`
				AvatarURL         string `json:"avatar_url"`
				GravatarID        string `json:"gravatar_id"`
				URL               string `json:"url"`
				HTMLURL           string `json:"html_url"`
				FollowersURL      string `json:"followers_url"`
				FollowingURL      string `json:"following_url"`
				GistsURL          string `json:"gists_url"`
				StarredURL        string `json:"starred_url"`
				SubscriptionsURL  string `json:"subscriptions_url"`
				OrganizationsURL  string `json:"organizations_url"`
				ReposURL          string `json:"repos_url"`
				EventsURL         string `json:"events_url"`
				ReceivedEventsURL string `json:"received_events_url"`
				Type              string `json:"type"`
				SiteAdmin         bool   `json:"site_admin"`
			} `json:"owner"`
			HTMLURL          string      `json:"html_url"`
			Description      interface{} `json:"description"`
			Fork             bool        `json:"fork"`
			URL              string      `json:"url"`
			ForksURL         string      `json:"forks_url"`
			KeysURL          string      `json:"keys_url"`
			CollaboratorsURL string      `json:"collaborators_url"`
			TeamsURL         string      `json:"teams_url"`
			HooksURL         string      `json:"hooks_url"`
			IssueEventsURL   string      `json:"issue_events_url"`
			EventsURL        string      `json:"events_url"`
			AssigneesURL     string      `json:"assignees_url"`
			BranchesURL      string      `json:"branches_url"`
			TagsURL          string      `json:"tags_url"`
			BlobsURL         string      `json:"blobs_url"`
			GitTagsURL       string      `json:"git_tags_url"`
			GitRefsURL       string      `json:"git_refs_url"`
			TreesURL         string      `json:"trees_url"`
			StatusesURL      string      `json:"statuses_url"`
			LanguagesURL     string      `json:"languages_url"`
			StargazersURL    string      `json:"stargazers_url"`
			ContributorsURL  string      `json:"contributors_url"`
			SubscribersURL   string      `json:"subscribers_url"`
			SubscriptionURL  string      `json:"subscription_url"`
			CommitsURL       string      `json:"commits_url"`
			GitCommitsURL    string      `json:"git_commits_url"`
			CommentsURL      string      `json:"comments_url"`
			IssueCommentURL  string      `json:"issue_comment_url"`
			ContentsURL      string      `json:"contents_url"`
			CompareURL       string      `json:"compare_url"`
			MergesURL        string      `json:"merges_url"`
			ArchiveURL       string      `json:"archive_url"`
			DownloadsURL     string      `json:"downloads_url"`
			IssuesURL        string      `json:"issues_url"`
			PullsURL         string      `json:"pulls_url"`
			MilestonesURL    string      `json:"milestones_url"`
			NotificationsURL string      `json:"notifications_url"`
			LabelsURL        string      `json:"labels_url"`
			ReleasesURL      string      `json:"releases_url"`
			DeploymentsURL   string      `json:"deployments_url"`
			CreatedAt        time.Time   `json:"created_at"`
			UpdatedAt        time.Time   `json:"updated_at"`
			PushedAt         time.Time   `json:"pushed_at"`
			GitURL           string      `json:"git_url"`
			SSHURL           string      `json:"ssh_url"`
			CloneURL         string      `json:"clone_url"`
			SvnURL           string      `json:"svn_url"`
			Homepage         interface{} `json:"homepage"`
			Size             int         `json:"size"`
			StargazersCount  int         `json:"stargazers_count"`
			WatchersCount    int         `json:"watchers_count"`
			Language         interface{} `json:"language"`
			HasIssues        bool        `json:"has_issues"`
			HasProjects      bool        `json:"has_projects"`
			HasDownloads     bool        `json:"has_downloads"`
			HasWiki          bool        `json:"has_wiki"`
			HasPages         bool        `json:"has_pages"`
			ForksCount       int         `json:"forks_count"`
			MirrorURL        interface{} `json:"mirror_url"`
			Archived         bool        `json:"archived"`
			Disabled         bool        `json:"disabled"`
			OpenIssuesCount  int         `json:"open_issues_count"`
			License          interface{} `json:"license"`
			Forks            int         `json:"forks"`
			OpenIssues       int         `json:"open_issues"`
			Watchers         int         `json:"watchers"`
			DefaultBranch    string      `json:"default_branch"`
		} `json:"repository"`
		Sender struct {
			Login             string `json:"login"`
			ID                int    `json:"id"`
			NodeID            string `json:"node_id"`
			AvatarURL         string `json:"avatar_url"`
			GravatarID        string `json:"gravatar_id"`
			URL               string `json:"url"`
			HTMLURL           string `json:"html_url"`
			FollowersURL      string `json:"followers_url"`
			FollowingURL      string `json:"following_url"`
			GistsURL          string `json:"gists_url"`
			StarredURL        string `json:"starred_url"`
			SubscriptionsURL  string `json:"subscriptions_url"`
			OrganizationsURL  string `json:"organizations_url"`
			ReposURL          string `json:"repos_url"`
			EventsURL         string `json:"events_url"`
			ReceivedEventsURL string `json:"received_events_url"`
			Type              string `json:"type"`
			SiteAdmin         bool   `json:"site_admin"`
		} `json:"sender"`
	}

	gitlabPushPayload struct {
		ObjectKind   string `json:"object_kind"`
		Before       string `json:"before"`
		After        string `json:"after"`
		Ref          string `json:"ref"`
		CheckoutSha  string `json:"checkout_sha"`
		UserID       int    `json:"user_id"`
		UserName     string `json:"user_name"`
		UserUsername string `json:"user_username"`
		UserEmail    string `json:"user_email"`
		UserAvatar   string `json:"user_avatar"`
		ProjectID    int    `json:"project_id"`
		Project      struct {
			ID                int         `json:"id"`
			Name              string      `json:"name"`
			Description       string      `json:"description"`
			WebURL            string      `json:"web_url"`
			AvatarURL         interface{} `json:"avatar_url"`
			GitSSHURL         string      `json:"git_ssh_url"`
			GitHTTPURL        string      `json:"git_http_url"`
			Namespace         string      `json:"namespace"`
			VisibilityLevel   int         `json:"visibility_level"`
			PathWithNamespace string      `json:"path_with_namespace"`
			DefaultBranch     string      `json:"default_branch"`
			Homepage          string      `json:"homepage"`
			URL               string      `json:"url"`
			SSHURL            string      `json:"ssh_url"`
			HTTPURL           string      `json:"http_url"`
		} `json:"project"`
		Repository struct {
			Name            string `json:"name"`
			URL             string `json:"url"`
			Description     string `json:"description"`
			Homepage        string `json:"homepage"`
			GitHTTPURL      string `json:"git_http_url"`
			GitSSHURL       string `json:"git_ssh_url"`
			VisibilityLevel int    `json:"visibility_level"`
		} `json:"repository"`
		Commits []struct {
			ID        string    `json:"id"`
			Message   string    `json:"message"`
			Title     string    `json:"title"`
			Timestamp time.Time `json:"timestamp"`
			URL       string    `json:"url"`
			Author    struct {
				Name  string `json:"name"`
				Email string `json:"email"`
			} `json:"author"`
			Added    []string      `json:"added"`
			Modified []string      `json:"modified"`
			Removed  []interface{} `json:"removed"`
		} `json:"commits"`
		TotalCommitsCount int `json:"total_commits_count"`
	}

	gitlabPullRequestPayload struct {
		ObjectKind string `json:"object_kind"`
		User       struct {
			Name      string `json:"name"`
			Username  string `json:"username"`
			AvatarURL string `json:"avatar_url"`
		} `json:"user"`
		Project struct {
			ID                int         `json:"id"`
			Name              string      `json:"name"`
			Description       string      `json:"description"`
			WebURL            string      `json:"web_url"`
			AvatarURL         interface{} `json:"avatar_url"`
			GitSSHURL         string      `json:"git_ssh_url"`
			GitHTTPURL        string      `json:"git_http_url"`
			Namespace         string      `json:"namespace"`
			VisibilityLevel   int         `json:"visibility_level"`
			PathWithNamespace string      `json:"path_with_namespace"`
			DefaultBranch     string      `json:"default_branch"`
			Homepage          string      `json:"homepage"`
			URL               string      `json:"url"`
			SSHURL            string      `json:"ssh_url"`
			HTTPURL           string      `json:"http_url"`
		} `json:"project"`
		Repository struct {
			Name        string `json:"name"`
			URL         string `json:"url"`
			Description string `json:"description"`
			Homepage    string `json:"homepage"`
		} `json:"repository"`
		ObjectAttributes struct {
			ID              int         `json:"id"`
			TargetBranch    string      `json:"target_branch"`
			SourceBranch    string      `json:"source_branch"`
			SourceProjectID int         `json:"source_project_id"`
			AuthorID        int         `json:"author_id"`
			AssigneeID      int         `json:"assignee_id"`
			Title           string      `json:"title"`
			CreatedAt       time.Time   `json:"created_at"`
			UpdatedAt       time.Time   `json:"updated_at"`
			MilestoneID     interface{} `json:"milestone_id"`
			State           string      `json:"state"`
			MergeStatus     string      `json:"merge_status"`
			TargetProjectID int         `json:"target_project_id"`
			Iid             int         `json:"iid"`
			Description     string      `json:"description"`
			Source          struct {
				Name              string      `json:"name"`
				Description       string      `json:"description"`
				WebURL            string      `json:"web_url"`
				AvatarURL         interface{} `json:"avatar_url"`
				GitSSHURL         string      `json:"git_ssh_url"`
				GitHTTPURL        string      `json:"git_http_url"`
				Namespace         string      `json:"namespace"`
				VisibilityLevel   int         `json:"visibility_level"`
				PathWithNamespace string      `json:"path_with_namespace"`
				DefaultBranch     string      `json:"default_branch"`
				Homepage          string      `json:"homepage"`
				URL               string      `json:"url"`
				SSHURL            string      `json:"ssh_url"`
				HTTPURL           string      `json:"http_url"`
			} `json:"source"`
			Target struct {
				Name              string      `json:"name"`
				Description       string      `json:"description"`
				WebURL            string      `json:"web_url"`
				AvatarURL         interface{} `json:"avatar_url"`
				GitSSHURL         string      `json:"git_ssh_url"`
				GitHTTPURL        string      `json:"git_http_url"`
				Namespace         string      `json:"namespace"`
				VisibilityLevel   int         `json:"visibility_level"`
				PathWithNamespace string      `json:"path_with_namespace"`
				DefaultBranch     string      `json:"default_branch"`
				Homepage          string      `json:"homepage"`
				URL               string      `json:"url"`
				SSHURL            string      `json:"ssh_url"`
				HTTPURL           string      `json:"http_url"`
			} `json:"target"`
			LastCommit struct {
				ID        string    `json:"id"`
				Message   string    `json:"message"`
				Timestamp time.Time `json:"timestamp"`
				URL       string    `json:"url"`
				Author    struct {
					Name  string `json:"name"`
					Email string `json:"email"`
				} `json:"author"`
			} `json:"last_commit"`
			WorkInProgress bool   `json:"work_in_progress"`
			URL            string `json:"url"`
			Action         string `json:"action"`
			Assignee       struct {
				Name      string `json:"name"`
				Username  string `json:"username"`
				AvatarURL string `json:"avatar_url"`
			} `json:"assignee"`
		} `json:"object_attributes"`
		Labels []struct {
			ID          int       `json:"id"`
			Title       string    `json:"title"`
			Color       string    `json:"color"`
			ProjectID   int       `json:"project_id"`
			CreatedAt   time.Time `json:"created_at"`
			UpdatedAt   time.Time `json:"updated_at"`
			Template    bool      `json:"template"`
			Description string    `json:"description"`
			Type        string    `json:"type"`
			GroupID     int       `json:"group_id"`
		} `json:"labels"`
		Changes struct {
			UpdatedByID struct {
				Previous interface{} `json:"previous"`
				Current  int         `json:"current"`
			} `json:"updated_by_id"`
			UpdatedAt struct {
				Previous string `json:"previous"`
				Current  string `json:"current"`
			} `json:"updated_at"`
			Labels struct {
				Previous []struct {
					ID          int       `json:"id"`
					Title       string    `json:"title"`
					Color       string    `json:"color"`
					ProjectID   int       `json:"project_id"`
					CreatedAt   time.Time `json:"created_at"`
					UpdatedAt   time.Time `json:"updated_at"`
					Template    bool      `json:"template"`
					Description string    `json:"description"`
					Type        string    `json:"type"`
					GroupID     int       `json:"group_id"`
				} `json:"previous"`
				Current []struct {
					ID          int       `json:"id"`
					Title       string    `json:"title"`
					Color       string    `json:"color"`
					ProjectID   int       `json:"project_id"`
					CreatedAt   time.Time `json:"created_at"`
					UpdatedAt   time.Time `json:"updated_at"`
					Template    bool      `json:"template"`
					Description string    `json:"description"`
					Type        string    `json:"type"`
					GroupID     int       `json:"group_id"`
				} `json:"current"`
			} `json:"labels"`
		} `json:"changes"`
	}

	giteaPushPayload struct {
		Secret     string `json:"secret"`
		Before     string `json:"before"`
		Repository struct {
			OriginalURL               string      `json:"original_url"`
			HTMLURL                   string      `json:"html_url"`
			AvatarURL                 string      `json:"avatar_url"`
			SSHURL                    string      `json:"ssh_url"`
			AllowMergeCommits         bool        `json:"allow_merge_commits"`
			HasPullRequests           bool        `json:"has_pull_requests"`
			Internal                  bool        `json:"internal"`
			Description               string      `json:"description"`
			Parent                    interface{} `json:"parent"`
			CloneURL                  string      `json:"clone_url"`
			WatchersCount             int         `json:"watchers_count"`
			DefaultBranch             string      `json:"default_branch"`
			CreatedAt                 time.Time   `json:"created_at"`
			HasIssues                 bool        `json:"has_issues"`
			IgnoreWhitespaceConflicts bool        `json:"ignore_whitespace_conflicts"`
			ID                        int         `json:"id"`
			Name                      string      `json:"name"`
			Private                   bool        `json:"private"`
			Fork                      bool        `json:"fork"`
			StarsCount                int         `json:"stars_count"`
			OpenPrCounter             int         `json:"open_pr_counter"`
			AllowSquashMerge          bool        `json:"allow_squash_merge"`
			AllowRebaseExplicit       bool        `json:"allow_rebase_explicit"`
			Template                  bool        `json:"template"`
			Size                      int         `json:"size"`
			Archived                  bool        `json:"archived"`
			UpdatedAt                 time.Time   `json:"updated_at"`
			InternalTracker           struct {
				EnableTimeTracker                bool `json:"enable_time_tracker"`
				AllowOnlyContributorsToTrackTime bool `json:"allow_only_contributors_to_track_time"`
				EnableIssueDependencies          bool `json:"enable_issue_dependencies"`
			} `json:"internal_tracker"`
			HasWiki bool `json:"has_wiki"`
			Owner   struct {
				ID        int       `json:"id"`
				Email     string    `json:"email"`
				AvatarURL string    `json:"avatar_url"`
				IsAdmin   bool      `json:"is_admin"`
				Created   time.Time `json:"created"`
				Login     string    `json:"login"`
				FullName  string    `json:"full_name"`
				Language  string    `json:"language"`
				LastLogin time.Time `json:"last_login"`
				Username  string    `json:"username"`
			} `json:"owner"`
			FullName        string `json:"full_name"`
			ForksCount      int    `json:"forks_count"`
			AllowRebase     bool   `json:"allow_rebase"`
			Empty           bool   `json:"empty"`
			Mirror          bool   `json:"mirror"`
			Website         string `json:"website"`
			OpenIssuesCount int    `json:"open_issues_count"`
			ReleaseCounter  int    `json:"release_counter"`
			Permissions     struct {
				Pull  bool `json:"pull"`
				Admin bool `json:"admin"`
				Push  bool `json:"push"`
			} `json:"permissions"`
		} `json:"repository"`
		Pusher struct {
			Created   time.Time `json:"created"`
			Username  string    `json:"username"`
			Login     string    `json:"login"`
			FullName  string    `json:"full_name"`
			Language  string    `json:"language"`
			IsAdmin   bool      `json:"is_admin"`
			LastLogin time.Time `json:"last_login"`
			ID        int       `json:"id"`
			Email     string    `json:"email"`
			AvatarURL string    `json:"avatar_url"`
		} `json:"pusher"`
		Sender struct {
			Login     string    `json:"login"`
			Email     string    `json:"email"`
			Created   time.Time `json:"created"`
			IsAdmin   bool      `json:"is_admin"`
			LastLogin time.Time `json:"last_login"`
			Username  string    `json:"username"`
			ID        int       `json:"id"`
			FullName  string    `json:"full_name"`
			AvatarURL string    `json:"avatar_url"`
			Language  string    `json:"language"`
		} `json:"sender"`
		Ref        string `json:"ref"`
		After      string `json:"after"`
		CompareURL string `json:"compare_url"`
		Commits    []struct {
			Message      string      `json:"message"`
			URL          string      `json:"url"`
			Verification interface{} `json:"verification"`
			Timestamp    time.Time   `json:"timestamp"`
			Modified     []string    `json:"modified"`
			ID           string      `json:"id"`
			Author       struct {
				Username string `json:"username"`
				Name     string `json:"name"`
				Email    string `json:"email"`
			} `json:"author"`
			Committer struct {
				Name     string `json:"name"`
				Email    string `json:"email"`
				Username string `json:"username"`
			} `json:"committer"`
			Added   []interface{} `json:"added"`
			Removed []interface{} `json:"removed"`
		} `json:"commits"`
		HeadCommit interface{} `json:"head_commit"`
	}

	giteaPullRequestPayload struct {
		PullRequest struct {
			ID             int         `json:"id"`
			MergeCommitSha interface{} `json:"merge_commit_sha"`
			Body           string      `json:"body"`
			Assignees      interface{} `json:"assignees"`
			Head           struct {
				RepoID int `json:"repo_id"`
				Repo   struct {
					Parent            interface{} `json:"parent"`
					HTMLURL           string      `json:"html_url"`
					CloneURL          string      `json:"clone_url"`
					UpdatedAt         time.Time   `json:"updated_at"`
					HasIssues         bool        `json:"has_issues"`
					AllowRebase       bool        `json:"allow_rebase"`
					OriginalURL       string      `json:"original_url"`
					HasWiki           bool        `json:"has_wiki"`
					AllowMergeCommits bool        `json:"allow_merge_commits"`
					Template          bool        `json:"template"`
					SSHURL            string      `json:"ssh_url"`
					ReleaseCounter    int         `json:"release_counter"`
					InternalTracker   struct {
						EnableTimeTracker                bool `json:"enable_time_tracker"`
						AllowOnlyContributorsToTrackTime bool `json:"allow_only_contributors_to_track_time"`
						EnableIssueDependencies          bool `json:"enable_issue_dependencies"`
					} `json:"internal_tracker"`
					AllowSquashMerge bool `json:"allow_squash_merge"`
					Owner            struct {
						AvatarURL string    `json:"avatar_url"`
						Language  string    `json:"language"`
						Email     string    `json:"email"`
						Login     string    `json:"login"`
						FullName  string    `json:"full_name"`
						IsAdmin   bool      `json:"is_admin"`
						LastLogin time.Time `json:"last_login"`
						Created   time.Time `json:"created"`
						Username  string    `json:"username"`
						ID        int       `json:"id"`
					} `json:"owner"`
					Fork          bool      `json:"fork"`
					OpenPrCounter int       `json:"open_pr_counter"`
					CreatedAt     time.Time `json:"created_at"`
					Permissions   struct {
						Admin bool `json:"admin"`
						Push  bool `json:"push"`
						Pull  bool `json:"pull"`
					} `json:"permissions"`
					IgnoreWhitespaceConflicts bool   `json:"ignore_whitespace_conflicts"`
					AvatarURL                 string `json:"avatar_url"`
					Size                      int    `json:"size"`
					Website                   string `json:"website"`
					OpenIssuesCount           int    `json:"open_issues_count"`
					DefaultBranch             string `json:"default_branch"`
					HasPullRequests           bool   `json:"has_pull_requests"`
					AllowRebaseExplicit       bool   `json:"allow_rebase_explicit"`
					FullName                  string `json:"full_name"`
					Description               string `json:"description"`
					Private                   bool   `json:"private"`
					ForksCount                int    `json:"forks_count"`
					WatchersCount             int    `json:"watchers_count"`
					Internal                  bool   `json:"internal"`
					ID                        int    `json:"id"`
					Name                      string `json:"name"`
					Empty                     bool   `json:"empty"`
					Mirror                    bool   `json:"mirror"`
					StarsCount                int    `json:"stars_count"`
					Archived                  bool   `json:"archived"`
				} `json:"repo"`
				Label string `json:"label"`
				Ref   string `json:"ref"`
				Sha   string `json:"sha"`
			} `json:"head"`
			Comments  int  `json:"comments"`
			Mergeable bool `json:"mergeable"`
			Base      struct {
				Label  string `json:"label"`
				Ref    string `json:"ref"`
				Sha    string `json:"sha"`
				RepoID int    `json:"repo_id"`
				Repo   struct {
					IgnoreWhitespaceConflicts bool   `json:"ignore_whitespace_conflicts"`
					AllowRebaseExplicit       bool   `json:"allow_rebase_explicit"`
					ID                        int    `json:"id"`
					Template                  bool   `json:"template"`
					Website                   string `json:"website"`
					Archived                  bool   `json:"archived"`
					HasIssues                 bool   `json:"has_issues"`
					Description               string `json:"description"`
					SSHURL                    string `json:"ssh_url"`
					OpenIssuesCount           int    `json:"open_issues_count"`
					ReleaseCounter            int    `json:"release_counter"`
					InternalTracker           struct {
						EnableTimeTracker                bool `json:"enable_time_tracker"`
						AllowOnlyContributorsToTrackTime bool `json:"allow_only_contributors_to_track_time"`
						EnableIssueDependencies          bool `json:"enable_issue_dependencies"`
					} `json:"internal_tracker"`
					HasPullRequests bool `json:"has_pull_requests"`
					Owner           struct {
						Language  string    `json:"language"`
						ID        int       `json:"id"`
						Email     string    `json:"email"`
						AvatarURL string    `json:"avatar_url"`
						LastLogin time.Time `json:"last_login"`
						Created   time.Time `json:"created"`
						Username  string    `json:"username"`
						Login     string    `json:"login"`
						FullName  string    `json:"full_name"`
						IsAdmin   bool      `json:"is_admin"`
					} `json:"owner"`
					Empty         bool        `json:"empty"`
					Parent        interface{} `json:"parent"`
					CloneURL      string      `json:"clone_url"`
					WatchersCount int         `json:"watchers_count"`
					AvatarURL     string      `json:"avatar_url"`
					Size          int         `json:"size"`
					StarsCount    int         `json:"stars_count"`
					Permissions   struct {
						Pull  bool `json:"pull"`
						Admin bool `json:"admin"`
						Push  bool `json:"push"`
					} `json:"permissions"`
					Private           bool      `json:"private"`
					Mirror            bool      `json:"mirror"`
					DefaultBranch     string    `json:"default_branch"`
					AllowMergeCommits bool      `json:"allow_merge_commits"`
					AllowRebase       bool      `json:"allow_rebase"`
					OriginalURL       string    `json:"original_url"`
					CreatedAt         time.Time `json:"created_at"`
					UpdatedAt         time.Time `json:"updated_at"`
					Fork              bool      `json:"fork"`
					HTMLURL           string    `json:"html_url"`
					ForksCount        int       `json:"forks_count"`
					OpenPrCounter     int       `json:"open_pr_counter"`
					Name              string    `json:"name"`
					FullName          string    `json:"full_name"`
					HasWiki           bool      `json:"has_wiki"`
					AllowSquashMerge  bool      `json:"allow_squash_merge"`
					Internal          bool      `json:"internal"`
				} `json:"repo"`
			} `json:"base"`
			Assignee interface{} `json:"assignee"`
			Merged   bool        `json:"merged"`
			PatchURL string      `json:"patch_url"`
			URL      string      `json:"url"`
			User     struct {
				Language  string    `json:"language"`
				IsAdmin   bool      `json:"is_admin"`
				Created   time.Time `json:"created"`
				Username  string    `json:"username"`
				Login     string    `json:"login"`
				FullName  string    `json:"full_name"`
				Email     string    `json:"email"`
				ID        int       `json:"id"`
				AvatarURL string    `json:"avatar_url"`
				LastLogin time.Time `json:"last_login"`
			} `json:"user"`
			DiffURL   string        `json:"diff_url"`
			MergedBy  interface{}   `json:"merged_by"`
			ClosedAt  interface{}   `json:"closed_at"`
			MergedAt  interface{}   `json:"merged_at"`
			MergeBase string        `json:"merge_base"`
			DueDate   interface{}   `json:"due_date"`
			Labels    []interface{} `json:"labels"`
			Milestone interface{}   `json:"milestone"`
			IsLocked  bool          `json:"is_locked"`
			HTMLURL   string        `json:"html_url"`
			CreatedAt time.Time     `json:"created_at"`
			UpdatedAt time.Time     `json:"updated_at"`
			Number    int           `json:"number"`
			Title     string        `json:"title"`
			State     string        `json:"state"`
		} `json:"pull_request"`
		Repository struct {
			Template        bool `json:"template"`
			StarsCount      int  `json:"stars_count"`
			WatchersCount   int  `json:"watchers_count"`
			OpenPrCounter   int  `json:"open_pr_counter"`
			InternalTracker struct {
				EnableTimeTracker                bool `json:"enable_time_tracker"`
				AllowOnlyContributorsToTrackTime bool `json:"allow_only_contributors_to_track_time"`
				EnableIssueDependencies          bool `json:"enable_issue_dependencies"`
			} `json:"internal_tracker"`
			AllowRebaseExplicit bool      `json:"allow_rebase_explicit"`
			OriginalURL         string    `json:"original_url"`
			OpenIssuesCount     int       `json:"open_issues_count"`
			HasPullRequests     bool      `json:"has_pull_requests"`
			Size                int       `json:"size"`
			Website             string    `json:"website"`
			UpdatedAt           time.Time `json:"updated_at"`
			Permissions         struct {
				Admin bool `json:"admin"`
				Push  bool `json:"push"`
				Pull  bool `json:"pull"`
			} `json:"permissions"`
			AllowRebase bool   `json:"allow_rebase"`
			AvatarURL   string `json:"avatar_url"`
			Owner       struct {
				FullName  string    `json:"full_name"`
				Language  string    `json:"language"`
				Email     string    `json:"email"`
				AvatarURL string    `json:"avatar_url"`
				IsAdmin   bool      `json:"is_admin"`
				LastLogin time.Time `json:"last_login"`
				Created   time.Time `json:"created"`
				Username  string    `json:"username"`
				ID        int       `json:"id"`
				Login     string    `json:"login"`
			} `json:"owner"`
			ReleaseCounter            int         `json:"release_counter"`
			Name                      string      `json:"name"`
			CloneURL                  string      `json:"clone_url"`
			CreatedAt                 time.Time   `json:"created_at"`
			Internal                  bool        `json:"internal"`
			HasWiki                   bool        `json:"has_wiki"`
			ID                        int         `json:"id"`
			FullName                  string      `json:"full_name"`
			Description               string      `json:"description"`
			Mirror                    bool        `json:"mirror"`
			HTMLURL                   string      `json:"html_url"`
			SSHURL                    string      `json:"ssh_url"`
			ForksCount                int         `json:"forks_count"`
			Private                   bool        `json:"private"`
			Archived                  bool        `json:"archived"`
			HasIssues                 bool        `json:"has_issues"`
			IgnoreWhitespaceConflicts bool        `json:"ignore_whitespace_conflicts"`
			Empty                     bool        `json:"empty"`
			Fork                      bool        `json:"fork"`
			Parent                    interface{} `json:"parent"`
			DefaultBranch             string      `json:"default_branch"`
			AllowMergeCommits         bool        `json:"allow_merge_commits"`
			AllowSquashMerge          bool        `json:"allow_squash_merge"`
		} `json:"repository"`
		Sender struct {
			Username  string    `json:"username"`
			FullName  string    `json:"full_name"`
			Email     string    `json:"email"`
			IsAdmin   bool      `json:"is_admin"`
			LastLogin time.Time `json:"last_login"`
			Created   time.Time `json:"created"`
			ID        int       `json:"id"`
			Login     string    `json:"login"`
			AvatarURL string    `json:"avatar_url"`
			Language  string    `json:"language"`
		} `json:"sender"`
		Review interface{} `json:"review"`
		Secret string      `json:"secret"`
		Action string      `json:"action"`
		Number int         `json:"number"`
	}
)
