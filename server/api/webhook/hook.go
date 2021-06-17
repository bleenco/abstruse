package webhook

import (
	"bytes"
	"context"
	"io/ioutil"
	"net/http"

	"github.com/bleenco/abstruse/pkg/gitscm"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
	"github.com/bleenco/abstruse/server/service/githook"
	"github.com/bleenco/abstruse/server/ws"
	"go.uber.org/zap"
)

// HandleHook returns an http.HandlerFunc that writes JSON encoded
// result to the http response body.
func HandleHook(
	repos core.RepositoryStore,
	builds core.BuildStore,
	scheduler core.Scheduler,
	ws *ws.Server,
	logger *zap.SugaredLogger,
) http.HandlerFunc {
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
			gitscm, err := gitscm.New(
				context.Background(),
				repo.Provider.Name,
				repo.Provider.URL,
				repo.Provider.AccessToken,
			)
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
				logger.Infof("webhook ignored, repository %s not active", repo.FullName)
				break
			}

			if hook.Event == core.EventPush && hook.Action == core.ActionDelete {
				logger.Infof("branch %s on repository %s deleted", hook.Target, repo.FullName)
				break
			}

			if hook.Event == core.EventPullRequest && hook.Action == core.ActionClose {
				logger.Infof("ref %s pull request on repository %s closed", hook.Ref, repo.FullName)
				break
			}

			// all good, trigger build.
			jobs, id, err := builds.GenerateBuild(&repo, hook)
			if err != nil {
				render.InternalServerError(w, err.Error())
				return
			}

			for _, job := range jobs {
				if err := scheduler.Next(job); err != nil {
					render.InternalServerError(w, err.Error())
					return
				}
			}

			// broadcast new build
			if build, err := builds.Find(id); err == nil {
				ws.App.Broadcast("/subs/builds", map[string]interface{}{"build": build})
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
