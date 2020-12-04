package logger

import (
	"os"

	"github.com/bleenco/abstruse/server/config"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

// New returns new zap logger from config.
func New(config *config.Config) (*zap.Logger, error) {
	cfg := config.Logger
	var logger *zap.Logger
	level := zap.NewAtomicLevel()

	err := level.UnmarshalText([]byte(cfg.Level))
	if err != nil {
		return nil, err
	}

	fw := zapcore.AddSync(&lumberjack.Logger{
		Filename:   cfg.Filename,
		MaxSize:    cfg.MaxSize, // megabytes
		MaxBackups: cfg.MaxBackups,
		MaxAge:     cfg.MaxAge, // days
	})
	cw := zapcore.Lock(os.Stdout)
	cores := make([]zapcore.Core, 0, 2)
	je := zapcore.NewJSONEncoder(zap.NewProductionEncoderConfig())
	cores = append(cores, zapcore.NewCore(je, fw, level))

	if cfg.Stdout {
		ce := zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig())
		cores = append(cores, zapcore.NewCore(ce, cw, level))
	}

	core := zapcore.NewTee(cores...)
	logger = zap.New(core)
	zap.ReplaceGlobals(logger)

	return logger, nil
}
