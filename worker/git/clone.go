package git

import (
	"fmt"
	"net"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/config"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/transport"
	"github.com/go-git/go-git/v5/plumbing/transport/http"
	gitssh "github.com/go-git/go-git/v5/plumbing/transport/ssh"
	"golang.org/x/crypto/ssh"
)

// CloneRepository clones repository contents to specified path.
func CloneRepository(url, ref, commit, user, pass, dir, sshURL string, sshKey []byte, useSSH bool) error {
	var auth transport.AuthMethod
	var err error

	if pass != "" && !useSSH {
		auth = &http.BasicAuth{
			Username: user,
			Password: pass,
		}
	} else if useSSH {
		url = sshURL

		if sshKey != nil {
			signer, err := ssh.ParsePrivateKey(sshKey)
			if err != nil {
				return err
			}
			auth = &gitssh.PublicKeys{
				User:   "git",
				Signer: signer,
				HostKeyCallbackHelper: gitssh.HostKeyCallbackHelper{
					HostKeyCallback: ssh.HostKeyCallback(func(hostname string, remote net.Addr, key ssh.PublicKey) error {
						return nil
					}),
				},
			}
		}
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

	reference, err := r.Head()
	if err != nil {
		return err
	}

	if reference.Name().String() != ref {
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
		Hash:  plumbing.NewHash(commit),
		Force: true,
	}); err != nil {
		return err
	}

	return nil
}
