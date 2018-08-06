FROM node:8.9-alpine

LABEL maintainer="Alexander Cai alexandercai@outlook.com" \
      repository="https://github.com/piguyinthesky/games-bot"
WORKDIR /usr/src/games-bot

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "bot.js"]