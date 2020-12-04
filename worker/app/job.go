package app

// func (a *App) startJob(job common.Job) error {
// 	logch := make(chan []byte, 1024)

// 	name := fmt.Sprintf("abstruse-job-%d", job.ID)
// 	image := job.Image
// 	env := strings.Split(job.Env, " ")
// 	var cmds []string
// 	if err := json.Unmarshal([]byte(job.Commands), &cmds); err != nil {
// 		return err
// 	}
// 	var commands [][]string
// 	for _, c := range cmds {
// 		commands = append(commands, strings.Split(c, " "))
// 	}

// 	dir, err := fs.TempDir()
// 	if err != nil {
// 		a.logger.Error(err.Error())
// 		return err
// 	}
// 	defer os.RemoveAll(dir)
// 	if err := git.CloneRepository(job.URL, job.Ref, job.CommitSHA, job.ProviderToken, dir); err != nil {
// 		a.logger.Error(err.Error())
// 		return err
// 	}

// 	go a.streamLog(logch, job)

// 	if err := docker.RunContainer(name, image, commands, env, dir, logch); err != nil {
// 		a.logger.Error(err.Error())
// 		return err
// 	}

// 	return nil
// }

// func (a *App) stopJob(name string) error {
// 	return docker.StopContainer(name)
// }

// func (a *App) streamLog(logch chan []byte, job common.Job) {
// 	for output := range logch {
// 		if stream, ok := a.api.logs[job.ID]; ok {
// 			log := &pb.JobOutput{Id: uint64(job.ID), Content: output}
// 			if err := stream.Send(log); err != nil {
// 				break
// 			}
// 		}
// 	}
// 	a.api.mu.Lock()
// 	defer a.api.mu.Unlock()
// 	delete(a.api.logs, job.ID)
// }
