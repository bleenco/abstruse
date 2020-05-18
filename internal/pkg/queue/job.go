package queue

import (
	jsoniter "github.com/json-iterator/go"
)

// Task definition.
type Task interface {
	GetID() uint64
	GetData() string
	ToJSON() (string, error)
}

// Item definition.
type Item struct {
	id   uint64 `json:"id"`
	data string `json:"data"`
}

func NewTask(id uint64, data string) Task {
	return &Item{id, data}
}

func (i *Item) GetID() uint64 {
	return i.id
}

func (i *Item) GetData() string {
	return i.data
}

func (i *Item) ToJSON() (string, error) {
	return jsoniter.MarshalToString(i)
}
