package security

import (
	"bytes"
	"image/png"

	"github.com/pquerna/otp"
	"github.com/pquerna/otp/totp"
)

func GenerateTOTP(email string) (*otp.Key, bytes.Buffer, error) {
	var buf bytes.Buffer
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "jkuri",
		AccountName: email,
	})
	if err != nil {
		return key, buf, err
	}

	img, err := key.Image(200, 200)
	if err != nil {
		return key, buf, err
	}
	png.Encode(&buf, img)

	return key, buf, nil
}
