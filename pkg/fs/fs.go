package fs

import (
	"io/ioutil"
	"os"
	"runtime"

	homedir "github.com/mitchellh/go-homedir"
)

// Exists check if file or directory exists on filesystem.
func Exists(filePath string) bool {
	if _, err := os.Stat(filePath); err == nil {
		return true
	}
	return false
}

// MakeDir creates directory on filesystem.
func MakeDir(dirPath string) error {
	return os.MkdirAll(dirPath, 0700)
}

// GetHomeDir returns full path to home directory
func GetHomeDir() (string, error) {
	return homedir.Dir()
}

// WriteFile writes file to disk.
func WriteFile(filePath, contents string) error {
	return ioutil.WriteFile(filePath, []byte(contents), 0644)
}

// DeleteFile deletes file from disk.
func DeleteFile(filePath string) error {
	return os.Remove(filePath)
}

// ReadFile read contents from file and return it as string.
func ReadFile(filePath string) (string, error) {
	contents, err := ioutil.ReadFile(filePath)
	return string(contents), err
}

// TempDir returns path to temporary directory
func TempDir() (string, error) {
	var tmp string
	if runtime.GOOS != "darwin" {
		tmp = os.TempDir()
	} else {
		tmp = "/tmp"
	}
	return ioutil.TempDir(tmp, "abstruse")
}
