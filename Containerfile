FROM node:lts-alpine3.24
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install
COPY . .
run npm run build
USER node
ENV NODE_ENV=production
EXPOSE 3000
ENTRYPOINT ["node", "./build/index.js"]
