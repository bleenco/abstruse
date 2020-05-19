package queue

// Item definition.
type Item struct {
	ID   uint64 `json:"id"`
	Data string `json:"data"`
}

// NewItem returns new job task item.
func NewItem(id uint64, data string) *Item {
	return &Item{id, data}
}
