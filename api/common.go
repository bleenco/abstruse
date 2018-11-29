package api

import (
	"encoding/json"
	"net/http"
)

// Response is interface flexible data response.
type Response struct {
	Data interface{} `json:"data"`
}

// DataResponse is the simplest JSON response used in API and it only contains
// `data` string.
type DataResponse struct {
	Data string `json:"data"`
}

// BoolResponse is the simplest JSON response used in API it only contains
// `data` with boolean type.
type BoolResponse struct {
	Data bool `json:"data"`
}

// ErrorResponse holds message of error returned when
// error on request happens
type ErrorResponse struct {
	Data string `json:"data"`
}

// JSONResponse is common function for returning JSON responses via API routes
func JSONResponse(res http.ResponseWriter, status int, data interface{}) {
	res.Header().Set("Content-Type", "application/json")
	res.WriteHeader(status)
	json.NewEncoder(res).Encode(data)
}
