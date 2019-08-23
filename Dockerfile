FROM node:10

# Create app directory
WORKDIR /home/ugmarket

# Environment variables which handle runtime behaviour.
ENV SERVICE_PORT 4000

# Install the modules and build the code.
# 'WITH_SASL' is required when we are building the kafka client.
COPY package.json .
RUN WITH_SASL=0 npm install --production --verbose
COPY . .

# Expose then start the server.
EXPOSE ${SERVICE_PORT}
CMD ["node", "./index.js"]
