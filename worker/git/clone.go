package git

import (
	"fmt"
	"strings"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/config"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/transport/http"
)

// CloneRepository clones repository contents to specified path.
func CloneRepository(url, ref, commit, token, dir string) error {
	auth := &http.BasicAuth{
		Username: "user",
		Password: token,
	}
	r, err := git.PlainClone(dir, false, &git.CloneOptions{
		URL:               url,
		Auth:              auth,
		Depth:             50,
		RecurseSubmodules: git.DefaultSubmoduleRecursionDepth,
	})
	if err != nil {
		return err
	}
	if !strings.HasSuffix(ref, "/master") {
		if err := r.Fetch(&git.FetchOptions{
			RefSpecs: []config.RefSpec{
				config.RefSpec(fmt.Sprintf("%s:%s", ref, ref)),
			},
			Auth: auth,
		}); err != nil {
			return err
		}
	}
	w, err := r.Worktree()
	if err != nil {
		return err
	}
	if err := w.Checkout(&git.CheckoutOptions{
		Branch: plumbing.ReferenceName(ref),
	}); err != nil {
		return err
	}
	if err := w.Checkout(&git.CheckoutOptions{
		Hash: plumbing.NewHash(commit),
	}); err != nil {
		return err
	}

	return nil
}
