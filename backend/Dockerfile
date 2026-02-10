FROM node:18-alpine
WORKDIR /app

# Install only production dependencies by default
COPY package*.json ./
RUN npm install --only=production

COPY . .

ENV NODE_ENV=production

# Match the port used by the app (see PORT env / index.js)
EXPOSE 5000

CMD ["node", "index.js"]