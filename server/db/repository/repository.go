package repository

// Repo holds all repository definitions.
type Repo struct {
	Provider ProviderRepo
	Repo     RepoRepository
	Token    TokenRepo
	User     UserRepo
	Build    BuildRepo
	Job      JobRepo
	Image    ImageRepo
}

// NewRepo initializes and returns Repo instance.
func NewRepo() Repo {
	return Repo{
		Provider: NewProviderRepo(),
		Repo:     NewRepoRepository(),
		Token:    NewTokenRepo(),
		User:     NewUserRepo(),
		Build:    NewBuildRepo(),
		Job:      NewJobRepo(),
		Image:    NewImageRepo(),
	}
}
