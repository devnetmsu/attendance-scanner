FROM arm32v6/node:8-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --only=production

# Bundle app source
COPY . .

ENTRYPOINT [ "npm", "run", "start" ]
