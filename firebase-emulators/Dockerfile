# FROM node:22

# # Instalar dependencias necesarias
# RUN apt-get update && apt-get install -y default-jre curl python3 python3-pip python3-venv
# RUN npm install -g firebase-tools

# # Crear el directorio de trabajo
# WORKDIR /app

# # Copiar el archivo de configuración del proyecto Firebase
# COPY . .

# # Copiar el script de mock Firestore
# # COPY mock_firestore.py ./

# # # Crear y activar un entorno virtual
# # RUN python3 -m venv venv
# # ENV PATH="/app/venv/bin:$PATH"

# # # Instalar dependencias de Python en el entorno virtual
# # RUN pip install --upgrade pip
# # RUN pip install requests firebase-admin

# # Exponer los puertos utilizados por los emuladores de Firebase
# EXPOSE 4000 8081 9099 9150 4400 4500

# # Comando para iniciar los emuladores de Firebase y ejecutar el script de mock Firestore
# # CMD ["firebase", "emulators:start"]
# RUN firebase emulators:start

# # & \
# #     /bin/bash -c 'while ! curl -s http://localhost:9099; do sleep 1; done; python mock_firestore.py'


# /firebase-emulators/Dockerfile
FROM node:alpine

RUN apk add openjdk11

# Install firebase-tools
RUN npm install -g firebase-tools

# Set working directory
WORKDIR /app

# Copy firebase configuration files
COPY . .

# Expose the ports used by Firebase emulators
EXPOSE 4000 9099 8081

# Start Firebase emulators
CMD firebase emulators:start
