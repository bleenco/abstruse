package logger

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/fatih/color"
)

type logWriter struct{}

func (w *logWriter) Write(bytes []byte) (int, error) {
	c := color.New(color.BgBlack, color.FgWhite).SprintFunc()
	timestr := c("[" + time.Now().Format("2006-01-02 15:04:05") + "]")
	return fmt.Print(timestr + " " + string(bytes))
}

// Logger represents application logger.
type Logger struct {
	prefix string
	logger *log.Logger
	level  string
}

// NewLogger returns new instance of Logger.
func NewLogger(prefix, level string) *Logger {
	logger := log.New(os.Stdout, "", 0)
	logger.SetOutput(new(logWriter))

	return &Logger{
		prefix: prefix,
		logger: logger,
		level:  level,
	}
}

// Infof method is used to print info messages.
func (l *Logger) Infof(f string, args ...interface{}) {
	if l.level == "none" || l.level == "error" || l.level == "fatal" {
		return
	}

	if l.prefix != "" {
		c := color.New(color.BgBlack, color.FgWhite).SprintFunc()
		prefix := c(fixedLengthString(10, l.prefix))
		l.logger.Printf("["+c(prefix)+"]"+": "+f, args...)
	} else {
		l.logger.Printf(f, args...)
	}
}

// Debugf method is used to print debug messages.
func (l *Logger) Debugf(f string, args ...interface{}) {
	if l.level != "debug" {
		return
	}

	if l.prefix != "" {
		c := color.New(color.BgBlack, color.FgWhite).SprintFunc()
		prefix := c(fixedLengthString(10, l.prefix))
		l.logger.Printf("["+c(prefix)+"]"+": "+f, args...)
	} else {
		l.logger.Printf(f, args...)
	}
}

// Errorf method is used to print error messages.
func (l *Logger) Errorf(f string, args ...interface{}) {
	if l.level == "none" {
		return
	}

	if l.prefix != "" {
		c := color.New(color.BgBlack, color.FgRed).SprintFunc()
		prefix := fixedLengthString(10, l.prefix)
		l.logger.Printf("["+c(prefix)+"]"+": "+f, args...)
	} else {
		l.logger.Printf(f, args...)
	}
}

func fixedLengthString(length int, str string) string {
	verb := fmt.Sprintf("%%-%d.%ds", length, length)
	return fmt.Sprintf(verb, str)
}
