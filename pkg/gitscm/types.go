package gitscm

// HookForm struct for saving webhooks.
type HookForm struct {
	Branch      bool `json:"branch" valid:"required"`
	Push        bool `json:"push" valid:"required"`
	PullRequest bool `json:"pullRequest" valid:"required"`
	Tag         bool `json:"tag" valid:"required"`
}
