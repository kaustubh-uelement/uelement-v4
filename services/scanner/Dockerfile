FROM node:22-alpine

# Install OpenSSL with TLS 1.3 support and Git for repo scanning
RUN apk update && apk add --no-cache openssl ca-certificates git

WORKDIR /app

COPY package.json ./
COPY lib/ ./lib/
COPY shared/ ./shared/
COPY server.mjs ./

ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0

EXPOSE 8080

CMD ["node", "--experimental-strip-types", "server.mjs"]
