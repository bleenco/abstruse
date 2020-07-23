package common

// Build defines struct used for starting builds.
type Build struct {
	Branch        string
	Ref           string
	CommitSHA     string
	CommitMessage string
	PrNumber      int
	PrTitle       string
	PrBody        string
	RepoURL       string
	RepoName      string
	AuthorEmail   string
	AuthorAvatar  string
	AuthorName    string
	AuthorLogin   string
	SenderEmail   string
	SenderName    string
	SenderAvatar  string
	SenderLogin   string
}
