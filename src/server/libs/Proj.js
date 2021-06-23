const proj4 = require('proj4');

export default {
    buffer(point)  {
        const buffer = 4000
        const coordinates = proj4('EPSG:4326', 'EPSG:900913', [point.lon, point.lat])

        const ulx = coordinates[0] - buffer
        const uly = coordinates[1] + buffer
        const lrx = coordinates[0] + buffer
        const lry = coordinates[1] - buffer
        return ulx + " " + uly + " " + lrx + " " + lry
    }
}