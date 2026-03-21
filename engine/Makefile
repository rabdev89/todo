# Makefile for BOB - AI Software Development Workflow Framework
# Provides automated installation and management commands

.PHONY: help install setup-index setup-ollama setup-qdrant setup-all test clean build run-agent run-pipeline \
	install-engine install-memory install-cli build-engine build-memory build-cli install-all build-all bundle-install seed-memory

# Default target
help:
	@echo "BOB - AI Software Development Workflow Framework - Make Commands"
	@echo ""
	@echo "Installation:"
	@echo "  install         - Install engine dependencies (legacy)"
	@echo "  install-engine  - Install engine dependencies"
	@echo "  install-memory  - Install packages/memory dependencies"
	@echo "  install-cli     - Install packages/cli dependencies"
	@echo "  install-all     - Install engine + memory + cli dependencies"
	@echo "  build-engine    - Build engine"
	@echo "  build-memory    - Build memory package"
	@echo "  build-cli       - Build cli toolkit"
	@echo "  build-all       - Build engine + memory + cli"
	@echo "  bundle-install  - Install & build engine + memory (official bundle)"
	@echo "  setup-all       - Complete setup (dependencies + services)"
	@echo "  setup-index     - Index repository"
	@echo "  setup-ollama    - Setup Ollama for embeddings"
	@echo "  setup-qdrant    - Setup Qdrant for vector storage"
	@echo "  seed-memory     - Seed knowledge database"

	@echo ""
	@echo "Development:"
	@echo "  build           - Build TypeScript project"
	@echo "  test            - Run tests"
	@echo "  clean           - Clean build artifacts"
	@echo ""
	@echo "Repository Intelligence:"
	@echo "  index           - Index codebase"
	@echo "  index-watch     - Index with file watching"
	@echo "  embed           - Generate embeddings"
	@echo "  search QUERY    - Search code"
	@echo "  research QUERY  - Research with AI"
	@echo "  overview        - Project overview"
	@echo ""
	@echo "Agent System:"
	@echo "  run-agent TICKET    - Run researcher agent"
	@echo "  run-pipeline TICKET  - Run complete agent pipeline"

# Installation commands
install:
	@echo "📦 Installing dependencies..."
	npm install
	@echo "✅ Dependencies installed"

install-engine:
	@echo "📦 Installing engine dependencies..."
	npm install
	@echo "✅ Engine dependencies installed"

install-memory:
	@echo "🧠 Installing memory package dependencies..."
	cd ../packages/memory && npm install
	@echo "✅ Memory package dependencies installed"

install-cli:
	@echo "🛠️  Installing cli toolkit dependencies..."
	cd ../packages/cli && npm install
	@echo "✅ CLI toolkit dependencies installed"

install-all: install-engine install-memory install-cli
	@echo "✅ All dependencies installed (engine + memory + cli)"

build-engine:
	@echo "🔨 Building engine..."
	npm run build
	@echo "✅ Engine build complete"

build-memory:
	@echo "🧱 Building memory package..."
	cd ../packages/memory && npm run build
	@echo "✅ Memory package build complete"

build-cli:
	@echo "⚙️  Building cli toolkit..."
	cd ../packages/cli && npm run build
	@echo "✅ CLI toolkit build complete"

build-all: build-memory build-engine build-cli
	@echo "✅ All builds complete (engine + memory + cli)"

bundle-install: install-all build-all seed-memory
	@echo "⚙️  Setting framework installation_type=normal"
	node -e "const fs=require('fs');const p=require('path').join('..','framework','framework_status.json');const j=JSON.parse(fs.readFileSync(p,'utf8'));j.installation_type='normal';fs.writeFileSync(p,JSON.stringify(j,null,2));console.log('installation_type set to',j.installation_type)"
	@echo "🎁 Bundle install complete (engine + memory)"

seed-memory: build-memory build-cli
	@echo "🌱 Seeding memory database..."
	cd ../packages/memory && node ../cli/dist/cli.js memory seed memory-seed.json
	@echo "✅ Memory database seeded"

setup-all: bundle-install setup-ollama setup-qdrant
	@echo "⚙️  Setting framework installation_type=complete"
	node -e "const fs=require('fs');const p=require('path').join('..','framework','framework_status.json');const j=JSON.parse(fs.readFileSync(p,'utf8'));j.installation_type='complete';fs.writeFileSync(p,JSON.stringify(j,null,2));console.log('installation_type set to',j.installation_type)"
	@echo "🎉 Complete setup finished!"

setup-index:
	@echo "📊 Indexing repository..."
	node dist/index.js index-repo -p ../web-applications
	@echo "✅ Repository indexed"

setup-ollama:
	@echo "🤖 Setting up Ollama..."
	@if ! command -v ollama &> /dev/null; then \
		echo "❌ Ollama not found. Please install from https://ollama.ai"; \
		exit 1; \
	fi
	@echo "📥 Pulling embedding model..."
	ollama pull nomic-embed-text
	@echo "🚀 Starting Ollama service..."
	ollama serve &
	@echo "✅ Ollama setup complete"

setup-qdrant:
	@echo "🗄️  Setting up Qdrant..."
	@if ! command -v docker &> /dev/null; then \
		echo "❌ Docker not found. Please install Docker"; \
		exit 1; \
	fi
	@echo "🐳 Starting Qdrant container..."
	docker run -d --name qdrant -p 6333:6333 qdrant/qdrant
	@echo "✅ Qdrant setup complete"

# Development commands
build:
	@echo "🔨 Building TypeScript project..."
	npm run build
	@echo "✅ Build complete"

test:
	@echo "🧪 Running tests..."
	npm test
	@echo "✅ Tests complete"

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist/
	rm -rf node_modules/
	@echo "✅ Clean complete"

# Repository Intelligence commands
index: build
	@echo "📊 Indexing repository..."
	node dist/index.js index-repo -p ../web-applications

index-watch: build
	@echo "👀 Indexing with file watching..."
	node dist/index.js index-repo -p ../web-applications --watch

embed: build
	@echo "🔤 Generating embeddings..."
	node dist/index.js embed

search: build
	@if [ -z "$(QUERY)" ]; then \
		echo "❌ Please provide a search query: make search QUERY='your query'"; \
		exit 1; \
	fi
	@echo "🔍 Searching for: $(QUERY)"
	node dist/index.js search "$(QUERY)"

research: build
	@if [ -z "$(QUERY)" ]; then \
		echo "❌ Please provide a research query: make research QUERY='your query'"; \
		exit 1; \
	fi
	@echo "🔬 Researching: $(QUERY)"
	node dist/index.js repo-research "$(QUERY)" --query

overview: build
	@echo "📊 Generating project overview..."
	node dist/index.js overview

# Agent System commands
run-agent: build
	@if [ -z "$(TICKET)" ]; then \
		echo "❌ Please provide a ticket ID: make run-agent TICKET=T-001"; \
		exit 1; \
	fi
	@echo "🤖 Running researcher agent for ticket: $(TICKET)"
	node dist/agent_orchestrator.js research "$(TICKET)"

run-pipeline: build
	@if [ -z "$(TICKET)" ]; then \
		echo "❌ Please provide a ticket ID: make run-pipeline TICKET=T-001"; \
		exit 1; \
	fi
	@echo "🔄 Running complete agent pipeline for ticket: $(TICKET)"
	node dist/agent_orchestrator.js pipeline "$(TICKET)"

# Dependency checker
check-deps:
	@echo "🔍 Checking dependencies..."
	@echo "Node.js: $$(node --version)"
	@echo "npm: $$(npm --version)"
	@if command -v ollama &> /dev/null; then \
		echo "✅ Ollama: $$(ollama --version)"; \
	else \
		echo "❌ Ollama: not found"; \
	fi
	@if command -v docker &> /dev/null; then \
		echo "✅ Docker: $$(docker --version)"; \
	else \
		echo "❌ Docker: not found"; \
	fi

# Quick start for new users
quick-start: check-deps setup-all
	@echo ""
	@echo "🎉 Quick start complete!"
	@echo ""
	@echo "Next steps:"
	@echo "1. Try a search: make search QUERY='authentication'"
	@echo "2. Research a ticket: make research QUERY='T-001'"
	@echo "3. Get overview: make overview"
	@echo "4. Run agent: make run-agent TICKET=T-001"
