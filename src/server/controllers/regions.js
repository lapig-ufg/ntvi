const { Pool, Client } = require('pg')

module.exports = function (app) {
    let Controller = {}
    const config = app.config;

    const client = new Client({
        user: config.user,
        host: config.host,
        database: config.database,
        password: config.password,
        port: config.port,
    })

    Controller.getRegionInfo = async function (request, response) {
        const { lon, lat } = request.params;
        const query = "select bioma, pais, id_regionc from regions where ST_INTERSECTS(geom,ST_GeomFromText('POINT(" + lon +" " + lat + "',4326));"
        console.log(query)
        try {
            client.connect()
            client.query(query, (err, res) => {
                console.log(err, res)
                client.end()
            })
        }catch (e) {
            console.error(e)
            response.status(500).json({error: true, message: e});
        }
    }

    return Controller;
}