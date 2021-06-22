
<div align="center">
  <br/>
  <img src="https://raw.githubusercontent.com/lapig-ufg/ntvi/main/src/client/src/assets/images/logos/logo_tvi.png" width="250" />
  <br/>
</div>

# Servidor

O Servidor da aplicação _Temporal Vision Inspection_ é o componente responsável por todas as operações de gerenciamento dos dados produzidos pela sistema, comunicação com os bancos de dados, integração com o Google Eearth Engine e controle da API REST do TVI.  

## Tecnologias utilizadas


- [MongoDB](https://docs.mongodb.com/drivers/node/current/fundamentals)
- [Node JS](https://nodejs.org/en/)
- [Prima ORM](https://www.prisma.io/)
- [PostgresSQL](https://www.postgresql.org/)

## Dependências

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
   
# Broker

O Broker é o gerenciador dos processos executados em background do TVI, ou seja, as rotinas que são realizadas independentes do fluxo principal da aplicação. Na prática, as rotinas (_Jobs_) são organizadas em filas (_Queues_) e em seguidas processadas pela biblioteca [Bull](https://github.com/OptimalBits/bull). A necessidade da crição do Broker ocorre pela elevada demanda de operações que processam dados pesados e demoram muito para serem finalizadas.  

## Tecnologias utilizadas

- [Bull](https://github.com/OptimalBits/bull)
- [Google Earth Engine](https://earthengine.google.com/)


## Dependências

Os _scripts_ de geração das imagens das coleções Landsat e Sentinel foram escritos em _**python**_ e recomendamos usarem a versão **3.8** para execução deles.

- [earthengine-api](https://developers.google.com/earth-engine/guides/python_install)
  
        pip3 install earthengine-api && pip3 install google-auth-httplib2 && pip3 install launchpadlib
  
- [pymongo](https://pypi.org/project/pymongo/)
  
        pip3 install pymongo
  
- [python-dotenv](https://pypi.org/project/python-dotenv/)
  
        pip3 install python-dotenv
  
- [DateTimeRange](https://pypi.org/project/DateTimeRange/)
  
        pip3 install DateTimeRange


