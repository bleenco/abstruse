package render

// Empty represents an empty response.
type Empty struct{}

// Error represents a JSON encoded API error.
type Error struct {
	Message string `json:"message"`
}
