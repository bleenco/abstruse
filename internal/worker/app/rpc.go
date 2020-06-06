package app

func (app *App) emitCapacityInfo() error {
	// max, running := uint32(app.scheduler.max), uint32(app.scheduler.running)
	// info := &pb.CapacityInfo{Max: max, Running: running}
	// if err := app.api.capacity.Send(info); err != nil {
	// 	return err
	// }
	return nil
}
