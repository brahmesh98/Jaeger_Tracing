FROM mhart/alpine-node:10
WORKDIR Desktop/node-skeleton/test1
COPY package.json Desktop/node-skeleton/test1
RUN npm install --production
COPY . .
EXPOSE 4242
CMD node test1.js
