package core

// PullRequest defines struct used to start build.
type PullRequest struct {
	Number       int
	Ref          string
	CommitSHA    string
	Title        string
	Body         string
	RepoURL      string
	RepoBranch   string
	RepoName     string
	AuthorEmail  string
	AuthorAvatar string
	AuthorName   string
	AuthorLogin  string
	SenderEmail  string
	SenderName   string
	SenderAvatar string
	SenderLogin  string
}
