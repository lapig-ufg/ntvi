FROM registry.lapig.iesa.ufg.br/lapig-images-homol/app_ntvi:base

# Clone app and npm install on server
ENV URL_TO_APPLICATION_GITHUB="https://github.com/lapig-ufg/ntvi.git"
ENV BRANCH="develop"

LABEL maintainer="Renato Gomes <renatogomessilverio@gmail.com>"

RUN if [ -d "/APP/ntvi" ]; then rm -Rf /APP/ntvi; fi  && \
    cd /APP && git clone -b ${BRANCH} ${URL_TO_APPLICATION_GITHUB}
    
ADD ./src/server/node_modules /APP/ntvi/src/server/node_modules  
ADD ./src/client/dist /APP/ntvi/src/client/dist

CMD [ "/bin/bash", "-c", "/APP/src/server/prod-start.sh; tail -f /dev/null"]

ENTRYPOINT [ "/APP/Monitora.sh"]
