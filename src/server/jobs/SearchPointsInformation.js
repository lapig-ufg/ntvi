import axios from 'axios';

export default {
    key: 'SearchPointsInformation',
    options: {
        delay: 5000,
    },
    async handle(data) {
        console.log(data);

        let promiseArray = linksArray.map( point => axios.get(`https://www.mapquestapi.com/geocoding/v1/reverse?key=bBVooFBpN6TcczLfcG0MVLyk7HDhgdxq&location=${lat}%2C${lon}&outFormat=json&thumbMaps=false`) );

        Promise.all( promiseArray )
        .then(
            results => {
                const points = results.map( el => el.data );

           }
        )
        .catch(console.log)
    },
};