package api

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestSystemVersionHandler(t *testing.T) {
	req, err := http.NewRequest("GET", "/version", nil)
	if err != nil {
		t.Fatal(err)
	}
	system := &system{}
	rr := httptest.NewRecorder()
	handler := system.version()
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	body := rr.Body.String()

	if !strings.Contains(body, "commitHash") {
		t.Errorf("response does not include commitHash property")
	}

	if !strings.Contains(body, "api") {
		t.Errorf("response does not include api property")
	}

	if !strings.Contains(body, "ui") {
		t.Errorf("response does not include ui property")
	}

	if !strings.Contains(body, "buildDate") {
		t.Errorf("response does not include buildDate property")
	}
}
