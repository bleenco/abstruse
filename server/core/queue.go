package core

import "github.com/bleenco/abstruse/pkg/logger"

// Queue defines FIFO job task buffer.
type Queue struct {
	nodes  []*JobTask
	size   int
	head   int
	tail   int
	count  int
	logger *logger.Logger
}

// Push adds a node to the queue.
func (q *Queue) Push(n *JobTask) {
	if q.head == q.tail && q.count > 0 {
		nodes := make([]*JobTask, len(q.nodes)+q.size)
		copy(nodes, q.nodes[q.head:])
		copy(nodes[len(q.nodes)-q.head:], q.nodes[:q.head])
		q.head = 0
		q.tail = len(q.nodes)
		q.nodes = nodes
	}
	q.nodes[q.tail] = n
	q.tail = (q.tail + 1) % len(q.nodes)
	q.count++
	q.logger.Debugf("job task %s saved to buffer [%d jobs in buffer]", n.task.Name, q.count)
}

// Pop removes and returns a node from the queue in first to last order.
func (q *Queue) Pop() *JobTask {
	if q.count == 0 {
		return nil
	}
	node := q.nodes[q.head]
	q.head = (q.head + 1) % len(q.nodes)
	q.count--
	q.logger.Debugf("returning job task %s from buffer [%d jobs in buffer]", node.task.Name, q.count)
	return node
}
