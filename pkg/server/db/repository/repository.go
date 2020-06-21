package repository

// Repo holds all repository definitions.
type Repo struct {
	Build    BuildRepository
	Job      JobRepository
	Provider ProviderRepository
	Repo     RepoRepository
	User     UserRepository
}

// NewRepo returns Repo instance.
func NewRepo(build BuildRepository, job JobRepository, provider ProviderRepository, repo RepoRepository, user UserRepository) Repo {
	return Repo{build, job, provider, repo, user}
}
