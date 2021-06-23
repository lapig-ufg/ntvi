
<div align="center">
  <br/>
  <img src="https://raw.githubusercontent.com/lapig-ufg/ntvi/main/src/client/src/assets/images/logos/logo_tvi.png" width="250" />
  <br/>
</div>

# Servidor

O Servidor da aplicação  _Temporal Vision Inspection_ (TVI) é o componente responsável por todas as operações de gerenciamento dos dados produzidos pelo sistema, comunicação com os bancos de dados, integração com o _Google Earth Engine_ (GEE) e controle da API REST do TVI.  

## Tecnologias utilizadas


- [MongoDB](https://docs.mongodb.com/drivers/node/current/fundamentals) é banco de dados de documentos, o que significa que ele armazena dados em documentos do tipo JSON.
- [Node JS](https://nodejs.org/en/) é um ambiente de execução Javascript _server-side_, baseado no motor V8 JavaScript do Chrome.
- [Prisma ORM](https://www.prisma.io/) é um  _Object Relational Mapper_ (ORM) escrito em JavaScript e TypeScript  que pode ser usado para construir servidores GraphQL, APIs REST e microsserviços. 
- [PostgresSQL](https://www.postgresql.org/) é um poderoso sistema de banco de dados relacional de código aberto que usa e estende a linguagem SQL combinada com muitos recursos que armazenam e escalam com segurança as cargas de trabalho de dados mais complicadas.

   
# Broker

O Broker é o gerenciador dos processos executados em _background_ do TVI, ou seja, as rotinas que são realizadas independentes do fluxo principal da aplicação. A necessidade da criação desse componente ocorre pela elevada demanda de operações como: o cadastro das campanhas e os seus pontos, a geração dos mosaicos das imagens e os seus respetivos *_caches_, esses procedimentos requerem muito tempo para serem finalizados. O "_cache_", nesse contexto, refere-se a produção antecipada das imagens recortadas para cada ponto da campanha. No fluxo padrão do TVI, essas imagens são geradas no momento da requisição do usuário levando bastante tempo para serem produzidas e, consequentemente, inviabilizando as rotinas de inspeções dos pontos.

<p align="center">
  <br/>
  <br/>
  <img src="https://miro.medium.com/max/438/1*2ljI2y9V3DyGX07mbD_msQ.png" />
  <br>
  <a  href="https://betterprogramming.pub/using-bull-to-manage-job-queues-in-a-node-js-micro-service-stack-7a6257e64509" target="_blank">Fig. 1 - Arquitetura do Worker. </a>
  <br/>
  <br/>
</p>

Sendo assim, o Broker surge com o objetivo controlar todas essas operações pesadas da aplicação. Esse componente funciona da seguinte forma: as rotinas (_Jobs_) são adicionadas nas filas (_Queues_) e, em seguida, processadas na ordem _first in first out_ (FIFO) pelos _Workers_, conforme é ilustrado na Figura 1.

<p align="center">
  <br/>
  <br/>
  <img src="https://raw.githubusercontent.com/OptimalBits/bull/develop/docs/job-lifecycle.png" />
  <br>
  <a href="https://github.com/OptimalBits/bull/tree/develop/docs" target="_blank"> Fig. 2 - Ciclo de vida dos <i>Jobs</i>.</a>
  <br/>
  <br/>
</p>

## Tecnologias utilizadas

- [Bull](https://github.com/OptimalBits/bull) é uma biblioteca que implementa um sistema de filas rápido e robusto baseado em redis.
- [Google Earth Engine](https://earthengine.google.com/) é uma plataforma em escala planetária para dados e análises de ciências da Terra.


## Dependências

### Python
Os _scripts_ de geração das imagens das coleções Landsat e Sentinel foram escritos em _**python**_ e recomendamos usarem a versão **3.8** para execução deles.

- [earthengine-api](https://developers.google.com/earth-engine/guides/python_install)
  
        pip3 install earthengine-api && pip3 install google-auth-httplib2 && pip3 install launchpadlib
  
- [pymongo](https://pypi.org/project/pymongo/)
  
        pip3 install pymongo
  
- [python-dotenv](https://pypi.org/project/python-dotenv/)
  
        pip3 install python-dotenv
  
- [DateTimeRange](https://pypi.org/project/DateTimeRange/)
  
        pip3 install DateTimeRange
  
- [numpy](https://pypi.org/project/numpy/)

        pip3 install numpy
  
- [opencv-python](https://pypi.org/project/opencv-python/)

         pip3 install opencv-python

### GDAL/OGR

GDAL é uma biblioteca de tradução para formatos de dados geoespaciais raster e vetoriais. OGR _Simple Features Library_ é uma biblioteca escrita em C++ de código aberto (e ferramentas de linha de comando) que fornece acesso de leitura (e às vezes gravação) a uma variedade de formatos de arquivo vetorial, incluindo ESRI Shapefiles, S-57, SDTS, PostGIS, Oracle Spatial e Mapinfo mid/mif e TAB. [Veja mais.](https://mothergeo-py.readthedocs.io/en/latest/development/how-to/gdal-ubuntu-pkg.html)

    #!/usr/bin/env bash
    sudo add-apt-repository ppa:ubuntugis/ppa
    sudo apt update
    sudo apt install -y gdal-bin
    sudo apt install -y libgdal-dev
    export CPLUS_INCLUDE_PATH=/usr/include/gdal
    export C_INCLUDE_PATH=/usr/include/gdal


Para verificar se a instalação ocorreu corretamente execute o comando:

    ogrinfo --version

Além da instalação do GDAL, também é utilizada no sistema a projeção Google Mercator EPSG:900913 que não é definida por padrão no arquivo de projeções da biblioteca. O primeiro passo é encontrar o arquivo **epsg**, normalmente ele é encontrado no endereço **/usr/share/proj/epsg** ou **/opt/google/earth/pro/resources/gdal/epsg**. Esse endereço varia conforme a instalação da _lib_. Em seguida, adicione o código abaixo no final do arquivo e salve. 

  
    #GOOGLE MERCATOR
    <900913> +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs
   


