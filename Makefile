FRONTEND_DIR = frontend
BACKEND_DIR  = backend

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make install"
	@echo "  make dev"
	@echo "  make dev-frontend"
	@echo "  make dev-backend"
	@echo "  make test"
	@echo "  make test-frontend"
	@echo "  make test-backend"
	@echo "  make build"

.PHONY: install
install:
	cd $(FRONTEND_DIR) && npm install
	cd $(BACKEND_DIR) && npm install

.PHONY: dev
dev:
	cd $(BACKEND_DIR) && npm run dev &
	cd $(FRONTEND_DIR) && npm run dev

.PHONY: dev-frontend
dev-frontend:
	cd $(FRONTEND_DIR) && npm run dev

.PHONY: dev-backend
dev-backend:
	cd $(BACKEND_DIR) && npm run dev

.PHONY: test
test:
	cd $(FRONTEND_DIR) && npm test
	cd $(BACKEND_DIR) && npm test

.PHONY: test-frontend
test-frontend:
	cd $(FRONTEND_DIR) && npm test

.PHONY: test-backend
test-backend:
	cd $(BACKEND_DIR) && npm test

.PHONY: build
build:
	cd $(FRONTEND_DIR) && npm run build
	cd $(BACKEND_DIR) && npm run build
