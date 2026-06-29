help:
	@echo "Available commands:"
	@echo "  build   - Build the project (up, install, compile)"
	@echo "  install - Install npm dependencies"
	@echo "  up      - Start containers"
	@echo "  stop    - Stop containers"
	@echo "  down    - Stop and remove containers"
	@echo "  compile - Compile the project using npm"
	@echo "  package - Package the extension into a .vsix file"
	@echo "  clean   - Remove generated files and *.vsix packages"
	@echo "  bash    - Open a bash shell in the node container"

build: up install compile

install:
	rm -rf node_modules
	@sleep 2
	docker compose exec node npm install

up:
	docker compose up -d

stop:
	docker compose stop

down:
	docker compose down

compile:
	docker compose exec node npm run compile

bash:
	docker compose exec node bash

package:
	docker compose exec node npm run package

clean:
	rm -rf out *.vsix