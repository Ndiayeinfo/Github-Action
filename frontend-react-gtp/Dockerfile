FROM node:20-alpine
WORKDIR /app

# Copier package.json et package-lock.json vers le dossier de travail
COPY package*.json ./

RUN npm install

# Copier le reste du code de l'application
COPY . .

EXPOSE 3000
ENV HOST=0.0.0.0

CMD ["npm", "start"]