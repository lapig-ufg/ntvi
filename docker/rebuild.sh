#!/bin/bash

# Parar e remover o contêiner existente
docker stop ntvi
docker rm ntvi

# Construir uma nova imagem
docker build -t lapig/app_ntvi:latest .

# Executar o novo contêiner
docker run -d -e BRANCH=main -p 3000:3000 --name ntvi lapig/app_ntvi:latest