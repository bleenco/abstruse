all: build

build:
	@CGO_ENABLED=0 go build -o build/abstruse cmd/abstruse/abstruse.go

clean:
	@rm -rf build/

.PHONY: clean build
