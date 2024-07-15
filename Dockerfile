# Use a multi-stage build to reduce the image size

########################################
# Stage 1: Build the application
########################################
# Base image
FROM node:20.11.0-alpine as builder

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied (make files owned by 'node' user instead of default root)
COPY --chown=node:node package*.json ./

# Install app dependencies using the `npm ci` command instead of `npm install`
RUN npm ci && npm cache clean --force

# Bundle app source (make files owned by 'node' user instead of default root)
COPY --chown=node:node . .

# Creates a "dist" folder with the production build
RUN npm run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN npm ci --only=production && npm cache clean --force

# Use the node user from the image (instead of the root user, to avoid security risks)
USER node

########################################
# Stage 2: Setup the production environment
######################################## 
FROM node:20.11.0-alpine

WORKDIR /usr/src/app

COPY --chown=node:node --from=builder /usr/src/app/dist ./dist
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules

# Start the server using the production build
CMD [ "node", "dist/main.js" ]