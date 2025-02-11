install:
	npm ci

lint:
	npx eslint

lint-fix:
	npx eslint . --fix

build:
	NODE_ENV=production npx webpack

develop:
	npx webpack serve
	
