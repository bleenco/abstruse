package api

import (
	"net/http"

	"github.com/bleenco/abstruse/pkg/render"
	"go.uber.org/zap"
)

type webhooks struct {
	logger *zap.SugaredLogger
}

func newWebhooks(logger *zap.Logger) webhooks {
	return webhooks{
		logger: logger.With(zap.String("type", "webhooks")).Sugar(),
	}
}

func (h *webhooks) hook() http.HandlerFunc {
	// dir := "/Users/jan/Desktop/webhooks"

	// return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	// 	headers := r.Header.Clone()
	// 	data, err := ioutil.ReadAll(r.Body)
	// 	if err != nil {
	// 		h.logger.Errorf("error: %v", err)
	// 	}
	// 	r.Body.Close()
	// 	r.Body = ioutil.NopCloser(bytes.NewBuffer(data))

	// 	var body interface{}
	// 	if err := json.Unmarshal(data, &body); err != nil {
	// 		h.logger.Errorf("error: %v", err)
	// 	}

	// 	file, err := json.MarshalIndent(body, "", "  ")
	// 	if err != nil {
	// 		h.logger.Errorf("error: %v", err)
	// 	}

	// 	now := time.Now().Format(time.RFC3339)

	// 	if err := fs.MakeDir(filepath.Join(dir, now)); err != nil {
	// 		h.logger.Errorf("error: %v", err)
	// 	}

	// 	filePath := filepath.Join(dir, now, "webhook.json")
	// 	headersPath := filepath.Join(dir, now, "headers.txt")

	// 	err = ioutil.WriteFile(filePath, file, 0644)
	// 	if err != nil {
	// 		h.logger.Errorf("error: %v", err)
	// 	}

	// 	var header string
	// 	for h, v := range headers {
	// 		for _, v := range v {
	// 			header += fmt.Sprintf("%s %s\n", h, v)
	// 		}
	// 	}
	// 	err = ioutil.WriteFile(headersPath, []byte(header), 0644)
	// 	if err != nil {
	// 		h.logger.Errorf("error: %v", err)
	// 	}

	// 	render.JSON(w, http.StatusOK, render.Empty{})
	// })

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		render.JSON(w, http.StatusOK, render.Empty{})
	})
}
