# bitcollector-server

Response for creating, reading, updating, deleting player data from database and delivering it to our Discord bot

# Populating your MongoDB with development data
you can run the script for this by using the script "populateDB" defined in package.json

# How to run
Clone both the server and bot from github, after that build both Dockerfiles from the bot and this directory.
Then make an docker-compose.yaml file at the root of both directories.
The docker-compose file runs both the server and bot with docker compose.

How the directory should look:
* bitcollector-bot (bot directory)
* bitcollector-server (this directory)
* docker-compose.yaml

docker-compose.yml contents (remember to replace values surrounded with <> to correct values):
```Dockerfile
services:
  bot:
    image: bitcollector-bot
    depends_on:
      [ backend ]
    build:
      context: ./bitcollector-bot
      dockerfile: Dockerfile
    environment:
      [ 
        DISCORD_TOKEN=<BOT DISCORD TOKEN>,
        GUILD_ID=<GUILD_ID FOR TESTING>,
        CLIENT_ID=<DISCORD APPLICATIONS CLIENT ID>,
        BACKEND_URL=http://backend:3000,
        APIKEY=<APIKEY FOR BACKEND>,
        NODE_ENV=<PRODUCTION | DEVELOPMENT>
      ]
    volumes:
      [ ./:/src/bot ]
    container_name: discordbot
  backend:
    image: bitcollector-server
    build:
      context: ./bitcollector-server
      dockerfile: Dockerfile
    environment:
      - PORT=3000
      - MONGODB_URI=<URI FOR MONGODB>
      - NODE_ENV=<PRODUCTION | DEVELOPMENT>
      - ADMIN_USERNAME=<ADMIN USERNAME FOR LOGIN>
      - ADMIN_PASSWORD=<ADMIN PASSWORD FOR LOGIN>
      - ADMIN_TOKEN=<ADMIN TOKEN THAT IS ACCEPTED>
    volumes:
      - ./:/src/server
    ports: 
      - 127.0.0.1:4000:3000
    container_name: backend
```