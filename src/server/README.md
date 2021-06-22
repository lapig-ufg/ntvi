
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

O Broker é o gerenciador dos processos executados em background do TVI, ou seja, as rotinas que são realizadas independentes do fluxo principal da aplicação. A necessidade da crição desse componente ocorre pela elevada demanda de operações que geram os mosaicos das imagens e os seus respectivos *_caches_, esses procedimentos requer muito tempo para serem finalizados. O "cache", nesse contexto, refere-se a produção antecipada das imagens "recortadas" para cada ponto da campanha. No fluxo padrão do TVI, essas imagens são geradas no momento da requisição do usuário levando bastante tempo para serem produzidas e, consequentemente, inviabilizando as rotinas de inspeções dos pontos.

<div align="center">
  <br/>
  <br/>
  <figure>
    <img src="https://miro.medium.com/max/438/1*2ljI2y9V3DyGX07mbD_msQ.png" />
    <figcaption  align="center">Fig. 1 - <a  align="center" href="https://betterprogramming.pub/using-bull-to-manage-job-queues-in-a-node-js-micro-service-stack-7a6257e64509" target="_blank">Arquitetura do Worker. </a></figcaption>
  </figure>
  <br/>
  <br/>
</div>

Na prática, essas rotinas (_Jobs_) são adiciondas nas filas (_Queues_) e, em seguida, processadas na ordem "FIFO" (_first in first out_) pelos _Workers_, conforme é ilustrado na Figura 1.


<div align="center">
  <br/>
  <br/>
  <figure>
    <img src="https://raw.githubusercontent.com/OptimalBits/bull/develop/docs/job-lifecycle.png" />
    <figcaption  align="center">Fig. 2 - <a align="center" href="https://github.com/OptimalBits/bull/tree/develop/docs" target="_blank"> Ciclo de vida dos <i>Jobs</i></a>.</figcaption>
  </figure>
  <br/>
  <br/>
</div>

## Tecnologias utilizadas

- [Bull](https://github.com/OptimalBits/bull) - biblioteca que implementa um sistema de filas rápido e robusto baseado em redis.
- [Google Earth Engine](https://earthengine.google.com/) - uma plataforma em escala planetária para dados e análises de ciências da Terra.


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


