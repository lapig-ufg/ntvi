import axios from 'axios';
import {CacheStatus, PrismaClient, TypeStatus} from '@prisma/client';
import {pointToTile} from 'global-mercator';

const prisma = new PrismaClient();

const tileServers = [
    'https://tm1.lapig.iesa.ufg.br',
    'https://tm2.lapig.iesa.ufg.br',
    'https://tm3.lapig.iesa.ufg.br',
    'https://tm4.lapig.iesa.ufg.br',
    'https://tm5.lapig.iesa.ufg.br'
];

const PERIODS = ['DRY', 'WET'];
const LAYERS = [
    { name: 'landsat', visparam: 'landsat-tvi-false' },
    { name: 's2_harmonized', visparam: 'tvi-red' }
];

// Definir o nível de zoom padrão
const DEFAULT_ZOOM_LEVEL = 13;

/**
 * Calcula os valores de x, y e z para o padrão XYZ usando tilebelt.
 * @param {number} latitude - Latitude do ponto.
 * @param {number} longitude - Longitude do ponto.
 * @param {number} zoom - Nível de zoom.
 * @returns {Object} - Valores de x, y e zoom no formato XYZ.
 */
const calculateXYZTiles = (latitude, longitude, zoom) => {
    const [xTile, yTile] = pointToTile([longitude, latitude], zoom);
    return { xTile, yTile, zoom };
};

/**
 * Gera as URLs para requisitar tiles no padrão XYZ com base nos períodos, camadas e servidores.
 * @param {Object} point - Objeto contendo latitude e longitude do ponto.
 * @param {Date} initialDate - Data inicial da campanha.
 * @param {Date} finalDate - Data final da campanha.
 * @param {number} zoom - Nível de zoom.
 * @returns {Array} - Uma lista de URLs para requisições de tiles.
 */
const generateTileRequests = (point, initialDate, finalDate, zoom = DEFAULT_ZOOM_LEVEL) => {
    const { latitude, longitude } = point;

    let requests = [];
    const startYear = new Date(initialDate).getFullYear();
    const endYear = new Date(finalDate).getFullYear();

    for (let year = startYear; year <= endYear; year++) {
        for (const period of PERIODS) {
            for (const layer of LAYERS) {
                for (let serverIndex = 0; serverIndex < tileServers.length; serverIndex++) {
                    const server = tileServers[serverIndex];

                    // Calcular x, y e z para o tile
                    const { xTile, yTile } = calculateXYZTiles(latitude, longitude, zoom);

                    // Gerar URL no formato XYZ
                    const url = `${server}/api/layers/${layer.name}/${xTile}/${yTile}/${zoom}?period=${period}&year=${year}&visparam=${layer.visparam}`;
                    requests.push(processTileRequest(url));
                }
            }
        }
    }

    return requests;
};

/**
 * Função para adicionar um atraso entre as tentativas de requisição.
 * @param {number} ms - Tempo de atraso em milissegundos.
 * @returns {Promise} - Promessa que será resolvida após o atraso.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Faz a requisição de um tile específico e trata falhas com uma abordagem de retry.
 * Inclui um delay entre as tentativas para evitar bloqueios pelo servidor.
 * @param {string} url - URL do tile.
 * @param {number} retries - Número de tentativas em caso de falha.
 * @param {number} delay - Tempo de delay entre as tentativas, em milissegundos.
 * @returns {Promise} - Promessa que resolve o resultado da requisição.
 */
const processTileRequest = async (url, retries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await sleep(200);
            console.log(`Tentando fetch: ${url}, tentativa ${attempt}`);
            const response = await axios.get(url);
            if (response.status === 200) {
                return response.data;
            } else {
                console.error(response);
                throw new Error(`Status de resposta inválido: ${response.status}`);
            }
        } catch (error) {
            console.error(`Erro na requisição do tile ${url}:`, error.message);
            if (attempt === retries) {
                throw new Error(`Falha ao obter o tile após ${retries} tentativas`);
            }
            // Aguardar o tempo de delay antes da próxima tentativa
            console.log(`Aguardando ${delay}ms antes de tentar novamente...`);
            await sleep(delay);
        }
    }
};

export default {
    key: 'PointsCache',
    options: {
        delay: 1000,  // Delay de 1 segundo entre tentativas
        timeout: 60000 // Timeout de 60 segundos por job
    },
    async handle(job, done) {
        const { data } = job;
        const { point, initialDate, finalDate } = data;

        try {
            job.progress(10);

            if (!point) {
                throw new Error(`Ponto com ID ${point.id} não encontrado.`);
            }
            await prisma.point.update({
                where: { id: point.id },
                data: { cacheStatus: CacheStatus.PROCESSING }
            });

            job.progress(30);

            // Gerar todas as requisições de tiles para o ponto
            const tileRequests = generateTileRequests(point, initialDate, finalDate);

            job.progress(50);

            // Executar todas as requisições de tiles
            const results = await Promise.all(tileRequests);

            job.progress(90);

            console.log(`Todos os tiles para o ponto ${point.id} foram cacheados com sucesso.`);
            // Atualizar o status de cache do ponto no banco de dados
            await prisma.point.update({
                where: { id: point.id },
                data: { cacheStatus: CacheStatus.SUCCESS }  // Usando o enum para marcar como cacheado com sucesso
            });

            // Verifica se todos os pontos da campanha estão com status SUCCESS
            const campaignId = point.campaignId;
            if (campaignId) {
                const allPointsCached = await prisma.point.findMany({
                    where: { campaignId: campaignId, cacheStatus: { not: CacheStatus.SUCCESS } },
                });

                // Se não houver pontos com cacheStatus diferente de SUCCESS, atualizar status da campanha para READY
                if (allPointsCached.length === 0) {
                    await prisma.campaign.update({
                        where: { id: campaignId },
                        data: { status: TypeStatus.READY },
                    });
                    console.log(`Campanha ${campaignId} atualizada para READY.`);
                }
            }


            job.progress(100);
            done(null, results); // Finaliza o job com sucesso

        } catch (error) {
            console.error(`Erro no processamento do ponto ${point.id}:`, error.message);
            await prisma.point.update({
                where: { id: point.id },
                data: { cacheStatus: CacheStatus.FAILED }  // Usando o enum para marcar como falha
            });
            done(new Error(`Erro no processamento do ponto: ${error.message}`)); // Finaliza o job com erro
        }
    }
};
