package ws

// Object represents generic message parameters.
type Object map[string]interface{}

// Message represents websocket message.
type Message struct {
	Type string `json:"type"`
	Data Object `json:"data"`
}
