FROM node:20-alpine AS base

# Instalar librerías OpenSSL y compatibilidad musl para Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3001

CMD ["node", "start.js"]
