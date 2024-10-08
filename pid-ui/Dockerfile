# Use the official Node.js 22 image as the base image
FROM node:22

# Establece el directorio de trabajo
WORKDIR /app

# Copia el archivo package.json y package-lock.json
COPY package.json package-lock.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Construye la aplicación para producción
RUN npm run build

# Exponer el puerto que utilizará la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación en modo producción
CMD ["npm", "start"]
