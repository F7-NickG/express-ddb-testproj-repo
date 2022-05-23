# syntax=docker/dockerfile:1
##
## BUILD
##
# Alpine for small footprint
FROM alpine:latest
# Alpine needs node, so install it
RUN apk add --update nodejs npm
# Set app location
WORKDIR '/app'
# Install app dependencies
# A wildcard is used to get both package.json & package.lock.json
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]