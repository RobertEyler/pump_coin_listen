FROM node:20-bullseye
WORKDIR /app
COPY . .
RUN mv ./.env.pro ./.env && npm install -g ts-node
CMD ["npm","run","all"]