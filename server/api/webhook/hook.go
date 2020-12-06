package webhook

import (
	"bytes"
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/bleenco/abstruse/pkg/gitscm"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
	"github.com/bleenco/abstruse/server/service/githook"
)

// HandleHook returns an http.HandlerFunc that writes JSON encoded
// result to the http response body.
func HandleHook(repos core.RepositoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		repositories, _, err := repos.List(core.RepositoryFilter{})
		if err != nil {
			render.InternalServerError(w, "no repositories found")
			return
		}

		fn := func(fullname string) *core.Repository {
			for _, repo := range repositories {
				if repo.FullName == fullname {
					return &repo
				}
			}
			return nil
		}

		for _, repo := range repositories {
			gitscm, err := gitscm.New(context.Background(), repo.Provider.Name, repo.Provider.URL, repo.Provider.AccessToken)
			if err != nil {
				continue
			}

			parser := githook.NewParser(gitscm.Client())
			hook, hrepo, err := parser.Parse(cloneRequest(r), fn)
			if err != nil {
				continue
			}

			if hook == nil {
				render.JSON(w, http.StatusOK, render.Empty{})
				return
			}

			repo, err := repos.FindUID(hrepo.UID)
			if err != nil {
				continue
			}

			if !repo.Active {
				log.Println("webhook ignored, repository not active")
				break
			}

			// all good, trigger build.
			fmt.Printf("%+v\n", hook)
			fmt.Printf("%+v\n", repo)

			if hook.Event == core.EventPush && hook.Action == core.ActionDelete {
				log.Printf("branch %s deleted\n", hook.Target)
				break
			}

			if hook.Event == core.EventPullRequest && hook.Action == core.ActionClose {
				log.Printf("ref %s pull request closed\n", hook.Ref)
				break
			}

			render.JSON(w, http.StatusOK, render.Empty{})
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	}
}

func cloneRequest(r *http.Request) *http.Request {
	r2 := r.Clone(context.Background())
	var b bytes.Buffer
	b.ReadFrom(r.Body)
	r.Body = ioutil.NopCloser(&b)
	r2.Body = ioutil.NopCloser(bytes.NewReader(b.Bytes()))
	return r2
}
