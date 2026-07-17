.PHONY: install ci run dev build preview check test clean help

help:
	@echo "install  - install deps"
	@echo "ci       - install deps (CI, reproducible via npm ci)"
	@echo "run/dev  - start dev server"
	@echo "build    - production build"
	@echo "preview  - preview build"
	@echo "check    - astro type check"
	@echo "test     - run tests"
	@echo "clean    - remove dist, .astro, node_modules"

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