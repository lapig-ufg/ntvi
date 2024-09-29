FROM lapig/ntvi:base

# Instalar curl
RUN apk update && apk add curl

# Clone app and npm install on server
ENV URL_TO_APPLICATION_GITHUB="https://github.com/lapig-ufg/ntvi.git"
ENV BRANCH="main"

WORKDIR /APP

RUN if [ -d "/APP/ntvi" ]; then rm -Rf /APP/ntvi; fi  && \
    cd /APP && git clone -b ${BRANCH} ${URL_TO_APPLICATION_GITHUB} && \
    mkdir -p /APP/ntvi/src/server/logs
    
ADD ../../src/server/node_modules /APP/ntvi/src/server/node_modules
ADD ../../src/client/dist /APP/ntvi/src/client/dist

ENTRYPOINT ["/bin/bash", "-c", "/APP/monitor.sh"]
