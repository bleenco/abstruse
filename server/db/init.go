package db

import "fmt"

func initDefaultValues() {
	// insert default teams
	rootTeam := Team{
		Title:       "Admins",
		Description: "Can access and set anything.",
		Color:       "#333333",
		IsDeletable: false,
		Permission: []*Permission{
			{Module: "server_management", Title: "Allows managing server settings", Read: true, Write: true, Execute: true},
			{Module: "teams_read", Title: "Allows reading all teams", Read: true},
			{Module: "teams_write", Title: "Allows adding and editing teams", Write: true},
			{Module: "users_delete", Title: "Allows deleting users"},
			{Module: "users_write", Title: "Allows adding and editing users"},
			{Module: "workers_read", Title: "Allows reading workers and its stats", Read: true},
			{Module: "workers_write", Title: "Allows editing workers and setting priorities", Read: true},
			{Module: "builds_read", Title: "Allows reading all builds", Read: true},
			{Module: "builds_execute", Title: "Allows triggering new builds and restarting existing ones", Write: true},
		},
	}

	if err := DB.Where("title = ? OR id = ?", rootTeam.Title, 1).First(&Team{}).Error; err != nil {
		DB.Create(&rootTeam)
	}

	// var team Team
	// if err := team.Find(1); err == nil {
	// 	if err := team.AddUser(1); err != nil {
	// 		fmt.Println(err)
	// 	}
	// } else {
	// 	fmt.Println(err)
	// }
}

func printError(err error) {
	fmt.Printf("error: %+v", err)
}
