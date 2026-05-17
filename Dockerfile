FROM node:20-alpine
WORKDIR /app

# Install dependencies for native modules (tesseract, canvas, etc.)
RUN apk add --no-cache libc6-compat python3 make g++

COPY package*.json ./
RUN npm ci --only=production=false

COPY . .
RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
