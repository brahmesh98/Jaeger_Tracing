FROM mhart/alpine-node:10
WORKDIR Desktop/node-skeleton/test2
COPY package.json Desktop/node-skeleton/test2
RUN npm install --production
COPY . .
EXPOSE 4241
ENV NODE_ENV=production
CMD node test2.js
