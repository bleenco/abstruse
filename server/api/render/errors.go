package render

import (
	"net/http"
)

// InternalServerError helper.
func InternalServerError(w http.ResponseWriter, msg string) {
	JSON(w, http.StatusInternalServerError, Error{Message: msg})
}

// UnathorizedError helper.
func UnathorizedError(w http.ResponseWriter, msg string) {
	JSON(w, http.StatusUnauthorized, Error{Message: msg})
}

// NotFoundError helper.
func NotFoundError(w http.ResponseWriter, msg string) {
	JSON(w, http.StatusNotFound, Error{Message: msg})
}

// ForbiddenError helper.
func ForbiddenError(w http.ResponseWriter, msg string) {
	JSON(w, http.StatusForbidden, Error{Message: msg})
}

// BadRequestError helper.
func BadRequestError(w http.ResponseWriter, msg string) {
	JSON(w, http.StatusBadRequest, Error{Message: msg})
}
