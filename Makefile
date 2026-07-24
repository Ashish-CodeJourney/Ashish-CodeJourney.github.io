.ONESHELL:
.PHONY: install ci run dev build preview check test clean help content-status publish

help:
	@echo "install        - install deps"
	@echo "ci             - install deps (CI, reproducible via npm ci)"
	@echo "run/dev        - start dev server"
	@echo "build          - production build"
	@echo "preview        - preview build"
	@echo "check          - astro type check"
	@echo "test           - run tests"
	@echo "clean          - remove dist, .astro, node_modules"
	@echo "content-status - show pending changes in content/ and its pointer"
	@echo "publish        - commit+push content/, then bump the submodule pointer"
	@echo "                 usage: make publish MSG=\"doc: my new post\""

install:
	npm install

ci:
	npm ci

run: dev

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

check:
	npm run check

test:
	npm run test

clean:
	rm -rf dist .astro node_modules

content-status:
	@echo "--- content/ (uncommitted changes) ---"
	@git -C content status --short --branch
	@echo
	@echo "--- site repo (submodule pointer) ---"
	@git status --short content

publish:
	@if [ -z "$(MSG)" ]; then \
		echo 'Usage: make publish MSG="doc: my new post"'; \
		exit 1; \
	fi
	@if [ -n "$$(git -C content status --porcelain)" ]; then \
		git -C content add -A; \
		git -C content commit -m "$(MSG)"; \
		git -C content push origin trunk; \
	else \
		echo "No changes in content/ to commit."; \
	fi
	@if git diff --quiet -- content && git diff --cached --quiet -- content; then \
		echo "Submodule pointer already up to date."; \
	else \
		git add content; \
		git commit -m "chore: update content submodule"; \
		git push origin trunk; \
	fi