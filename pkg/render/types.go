package render

// Error is used to return errors in JSON format.
type Error struct {
	Message string `json:"message"`
}

// Empty response.
type Empty struct{}
