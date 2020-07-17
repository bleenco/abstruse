package auth

import (
	"fmt"

	"github.com/bleenco/abstruse/pkg/fs"
)

func generateHtpasswdFile(filePath, user, password string) error {
	passwd, err := HashPassword(password)
	if err != nil {
		return err
	}
	creds := fmt.Sprintf("%s:%s\n", user, passwd)
	return fs.WriteFile(filePath, creds)
}
