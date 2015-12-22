BIN   = ./node_modules/.bin
PATH := $(BIN):$(PATH)
LIB   = $(shell find src -name "*.js")
DIST   = $(patsubst src/%.js,dist/%.js,$(LIB))

install:
	@npm $@

dist: $(DIST)
dist/%.js: src/%.js
	@mkdir -p $(@D)
	$(BIN)/babel $< -o $@ --stage 0

lint:
	@ $(BIN)/eslint ./src

test: lint
	@echo "\nTesting source files, hang on..."
	@NODE_ENV=test $(BIN)/mocha         \
		--compilers js:babel/register     \
		--require test/setup.js

test-build:
	@echo "\nTesting build files, almost there..!"
	@NODE_ENV=test $(BIN)/mocha         \
		--require dist/__tests__/testdom  \
		./dist/__tests__/*.test.js

clean:
	@rm -rf ./dist

build: clean dist

dev:
	@node ./example/server.js

release: build
	@ npm publish

.PHONY: install dev test clean dist test-build build