FROM node:14.13.1-stretch
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install
COPY . . 
RUN npm run build
COPY .env ./dist

EXPOSE 3000

CMD ["node", "./dist/main.js"]
