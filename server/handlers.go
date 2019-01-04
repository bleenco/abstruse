package server

import (
	"math/rand"
	"net/http"
	"strconv"

	"github.com/bleenco/abstruse/api"
	"github.com/bleenco/abstruse/api/parser"
	pb "github.com/bleenco/abstruse/proto"
	"github.com/julienschmidt/httprouter"
)

// TriggerBuildHandler triggers test build for repository.
func TriggerBuildHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	configParser := &parser.ConfigParser{}
	if err := configParser.Parse(); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	image, commands := configParser.Parsed.Image, configParser.Commands
	name := "abstruse_job_" + strconv.Itoa(rand.Intn(500)) + "_" + strconv.Itoa(rand.Intn(500))

	jobTask := &pb.JobTask{
		Name:     name,
		Code:     pb.JobTask_Start,
		Commands: commands,
		Image:    image,
	}
	MainScheduler.ScheduleJobTask(jobTask)

	api.JSONResponse(res, http.StatusOK, api.BoolResponse{Data: true})
}
