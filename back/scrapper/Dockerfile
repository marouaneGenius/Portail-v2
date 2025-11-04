FROM node:20-alpine

# Installation des dépendances nécessaires pour Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configuration pour utiliser le Chromium installé
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Création du répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du code source
COPY . .

# Création du répertoire pour les logs
RUN mkdir -p /app/logs

# Utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Port par défaut pour l'API REST
EXPOSE 3000

# Commande par défaut - API REST (pour déclenchement manuel depuis Symfony)
# Pour activer le CRON automatique, utilisez: CMD ["node", "src/index.js"]
CMD ["node", "src/api/server.js"]
