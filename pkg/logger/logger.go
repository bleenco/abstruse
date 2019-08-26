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
	prefix      string
	logger      *log.Logger
	Info, Debug bool
}

// NewLogger returns new instance of Logger.
func NewLogger(prefix string, info bool, debug bool) *Logger {
	logger := log.New(os.Stdout, "", 0)
	logger.SetOutput(new(logWriter))

	return &Logger{
		prefix: prefix,
		logger: logger,
		Info:   info,
		Debug:  debug,
	}
}

// Infof method is used to print info messages.
func (l *Logger) Infof(f string, args ...interface{}) {
	if !l.Info {
		return
	}

	if l.prefix != "" {
		c := color.New(color.BgBlack, color.FgWhite).SprintFunc()
		prefix := c(fixedLengthString(10, l.prefix))
		l.logger.Printf(c("[")+prefix+c("]")+": "+f, args...)
	} else {
		l.logger.Printf(f, args...)
	}
}

// Debugf method is used to print debug messages.
func (l *Logger) Debugf(f string, args ...interface{}) {
	if !l.Debug {
		return
	}

	if l.prefix != "" {
		c := color.New(color.BgBlack, color.FgWhite).SprintFunc()
		prefix := c(fixedLengthString(10, l.prefix))
		l.logger.Printf(c("[")+prefix+c("]")+": "+f, args...)
	} else {
		l.logger.Printf(f, args...)
	}
}

func fixedLengthString(length int, str string) string {
	verb := fmt.Sprintf("%%-%d.%ds", length, length)
	return fmt.Sprintf(verb, str)
}
