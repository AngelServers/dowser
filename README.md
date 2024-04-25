# Builds server
This repo is a simple platform to deploy your versions files.

### Install
```
git clone https://github.com/AngelServers/dowser

cd dowser
npm i

nano .env

npm start
```

### .env
```
# Default server
MAIN_SERVER=http://localhost:XXXX

# Node info
NODE_NAME=MAIN
PORT=XXXX
URL=http://localhost:XXXX
IP=XXX.XXX.XXX.XXX

# Bearer Tocket to Upload or Delete
AUTH_KEY=XXX
# Bearer Tocken for bridge comunication
BRIDGE_KEY=XXX
```
