FROM mhart/alpine-node:10
WORKDIR Desktop/node-skeleton/callapi
COPY package.json Desktop/node-skeleton/callapi
RUN npm install --production
COPY . .
EXPOSE 4000
#ENV NODE_ENV=production
CMD node callapi.js
