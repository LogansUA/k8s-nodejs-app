FROM node:16.14.0
EXPOSE 3000
COPY . .
CMD ["npm", "start"]