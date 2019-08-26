package security

import (
	"crypto/ecdsa"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"fmt"
	"math/big"
	"net"
	"os"
	"time"

	"github.com/bleenco/abstruse/pkg/fs"
)

// CheckAndGenerateCert checks if clients certificate exists and if not
// generates a new self-signed X.509 certificate for a TLS connections.
func CheckAndGenerateCert(cert, key string) {
	if !fs.Exists(cert) || !fs.Exists(key) {
		generateCertAndKey(cert, key)
	}
}

func generateCertAndKey(certPath, keyPath string) {
	host, err := os.Hostname()
	if err != nil {
		fatal(err)
	}
	validFor := time.Duration(365 * 24 * time.Hour)
	isCa := true
	rsaBits := 2048

	priv, err := rsa.GenerateKey(rand.Reader, rsaBits)
	if err != nil {
		fatal(err)
	}

	serialNumberLimit := new(big.Int).Lsh(big.NewInt(1), 128)
	serialNumber, err := rand.Int(rand.Reader, serialNumberLimit)
	if err != nil {
		fatal(err)
	}

	notBefore := time.Now()
	notAfter := notBefore.Add(validFor)

	template := x509.Certificate{
		SerialNumber: serialNumber,
		Subject: pkix.Name{
			Organization: []string{"abstruse CI"},
		},
		NotBefore:             notBefore,
		NotAfter:              notAfter,
		KeyUsage:              x509.KeyUsageKeyEncipherment | x509.KeyUsageDigitalSignature,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
	}

	template.IPAddresses = append(template.IPAddresses, net.IPv4(0, 0, 0, 0))
	if ip := net.ParseIP(host); ip != nil {
		template.IPAddresses = append(template.IPAddresses, ip)
	} else {
		template.DNSNames = append(template.DNSNames, host)
	}

	if isCa {
		template.IsCA = true
		template.KeyUsage |= x509.KeyUsageCertSign
	}

	derBytes, err := x509.CreateCertificate(rand.Reader, &template, &template, publicKey(priv), priv)
	if err != nil {
		fatal(err)
	}

	certOut, err := os.Create(certPath)
	if err != nil {
		fatal(err)
	}
	if err := pem.Encode(certOut, &pem.Block{Type: "CERTIFICATE", Bytes: derBytes}); err != nil {
		fatal(err)
	}
	if err := certOut.Close(); err != nil {
		fatal(err)
	}

	keyOut, err := os.OpenFile(keyPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		fatal(err)
	}
	if err := pem.Encode(keyOut, pemBlockForKey(priv)); err != nil {
		fatal(err)
	}
	if err := keyOut.Close(); err != nil {
		fatal(err)
	}
}

func publicKey(priv interface{}) interface{} {
	switch k := priv.(type) {
	case *rsa.PrivateKey:
		return &k.PublicKey
	case *ecdsa.PrivateKey:
		return &k.PublicKey
	default:
		return nil
	}
}

func pemBlockForKey(priv interface{}) *pem.Block {
	switch k := priv.(type) {
	case *rsa.PrivateKey:
		return &pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(k)}
	case *ecdsa.PrivateKey:
		b, err := x509.MarshalECPrivateKey(k)
		if err != nil {
			fatal(err)
		}
		return &pem.Block{Type: "EC PRIVATE KEY", Bytes: b}
	default:
		return nil
	}
}

func fatal(err error) {
	fmt.Printf("%+v\n", err)
	os.Exit(1)
}
