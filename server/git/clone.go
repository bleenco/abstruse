package git

import (
	"gopkg.in/src-d/go-git.v4/config"

	"gopkg.in/src-d/go-billy.v4/memfs"
	git "gopkg.in/src-d/go-git.v4"
	"gopkg.in/src-d/go-git.v4/plumbing"
	"gopkg.in/src-d/go-git.v4/storage/memory"
)

// FetchAbstruseConfig checks if .abstruse.yml config exists in repository, if
// so then reads it contents and returns it.
func FetchAbstruseConfig(url, branch, commit, pr string) (string, error) {
	r, err := git.Clone(memory.NewStorage(), memfs.New(), &git.CloneOptions{
		URL:   url,
		Depth: 50,
	})
	if err != nil {
		return "", err
	}

	if pr != "" {
		referenceName := "origin/pr/" + pr

		if err := r.Fetch(&git.FetchOptions{
			RefSpecs: []config.RefSpec{
				config.RefSpec("+refs/heads/*:refs/remotes/origin/*"),
				config.RefSpec("+refs/pull/*/head:refs/remotes/origin/pr/*"),
			},
		}); err != nil {
			return "", err
		}

		w, err := r.Worktree()
		if err != nil {
			return "", err
		}

		if err := w.Checkout(&git.CheckoutOptions{
			Branch: plumbing.ReferenceName(referenceName),
		}); err != nil {
			return "", err
		}
	}

	if commit != "" {
		w, err := r.Worktree()
		if err != nil {
			return "", err
		}

		if err := w.Checkout(&git.CheckoutOptions{
			Hash: plumbing.NewHash(commit),
		}); err != nil {
			return "", err
		}
	}

	ref, err := r.Head()
	if err != nil {
		return "", err
	}

	commitObject, err := r.CommitObject(ref.Hash())
	if err != nil {
		return "", err
	}

	tree, err := commitObject.Tree()
	if err != nil {
		return "", err
	}

	file, err := tree.File(".abstruse.yml")
	if err != nil {
		return "", err
	}

	contents, err := file.Contents()
	if err != nil {
		return "", err
	}

	return contents, err
}
