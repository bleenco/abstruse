package integration

import (
	"fmt"

	"github.com/bleenco/abstruse/server/api/integration/gitea"
)

func CheckGiteaIntegration() {
	client := gitea.NewClient("http://localhost:3000", "1b4a88fdf7bebb42401ef2d2bf9b43793110851d")

	user, err := client.GetUserInfo("jkuri")
	if err != nil {
		panic(err)
	}

	fmt.Printf("%+v\n", user)
}
