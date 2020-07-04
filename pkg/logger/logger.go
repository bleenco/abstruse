package logger

import (
	"os"

	"github.com/spf13/viper"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

// Options for logger.
type Options struct {
	Filename   string
	MaxSize    int
	MaxBackups int
	MaxAge     int
	Level      string
	Stdout     bool
}

// NewOptions returns options from config.
func NewOptions(v *viper.Viper) (*Options, error) {
	opts := &Options{}
	err := v.UnmarshalKey("log", opts)
	return opts, err
}

// NewLogger returns new zap logger from config.
func NewLogger(opts *Options) (*zap.Logger, error) {
	var logger *zap.Logger
	level := zap.NewAtomicLevel()

	err := level.UnmarshalText([]byte(opts.Level))
	if err != nil {
		return nil, err
	}

	fw := zapcore.AddSync(&lumberjack.Logger{
		Filename:   opts.Filename,
		MaxSize:    opts.MaxSize, // megabytes
		MaxBackups: opts.MaxBackups,
		MaxAge:     opts.MaxAge, // days
	})
	cw := zapcore.Lock(os.Stdout)
	cores := make([]zapcore.Core, 0, 2)
	je := zapcore.NewJSONEncoder(zap.NewProductionEncoderConfig())
	cores = append(cores, zapcore.NewCore(je, fw, level))

	if opts.Stdout {
		ce := zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig())
		cores = append(cores, zapcore.NewCore(ce, cw, level))
	}

	core := zapcore.NewTee(cores...)
	logger = zap.New(core)
	zap.ReplaceGlobals(logger)

	return logger, nil
}
