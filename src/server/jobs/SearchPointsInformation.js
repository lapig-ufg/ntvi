import axios from 'axios';
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

export default {
    key: 'SearchPointsInformation',
    options: {
        delay: 2000,
    },
    async handle({data}) {
        try {
            let arrayQueries = []
            for (const [i, point] of data.points.entries()) {
                let dta = await axios.get(`https://www.mapquestapi.com/geocoding/v1/reverse?key=bBVooFBpN6TcczLfcG0MVLyk7HDhgdxq&location=${point.latitude}%2C${point.longitude}&outFormat=json&thumbMaps=false`)
                let location =  dta.data.results[0].locations[0]
                let info = '';

                if(location.adminArea3 && location.adminArea5 && location.adminArea1){
                    info = location.adminArea5 + ' - ' + location.adminArea3 + ' - ' + location.adminArea1;
                } else if(location.adminArea5 && location.adminArea1) {
                    info = location.adminArea5 + ' - ' + location.adminArea1;
                } else {
                    info = location.adminArea3 + ' - ' + location.adminArea1;
                }
                arrayQueries.push(prisma.point.update({
                    where: {
                        id: parseInt(point.id),
                    },
                    data: {
                        info: info,
                    },
                }));
            }
            await prisma.$transaction(arrayQueries)
        } catch (e) {
            console.error(e)
        }

    },
};