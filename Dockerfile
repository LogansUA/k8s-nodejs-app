FROM node:alpine
WORKDIR /usr/lib/app
COPY package.json /usr/lib/app/package.json
RUN npm i --omit=dev
COPY index.js /usr/lib/app/index.js
EXPOSE 3000
CMD npm start
