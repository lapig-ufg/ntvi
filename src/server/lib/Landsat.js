import { GoogleEarthEngine } from "./GoogleEarthEngine";

export class Landsat extends GoogleEarthEngine {
    compositions;
    landsat_5;
    landsat_7;
    landsat_8;
    tiles;
    satellites;
    periods;

    constructor(campaign) {
        super(campaign);
        this.satellites =  [ 'L8', 'L7', 'L5' ];
        this.periods = [
            {
                "name": 'WET',
                "dtStart": '-01-01',
                "dtEnd": '-04-30'
            },
            {
                "name": 'DRY',
                "dtStart": '-06-01',
                "dtEnd": '-10-30'
            }
        ];
        this.getCompositions();
    }

    initSatellites() {
        this.landsat_5 = this.ee.ImageCollection("LANDSAT/LT05/C01/T1_TOA");
        this.landsat_7 = this.ee.ImageCollection("LANDSAT/LE07/C01/T1_TOA");
        this.landsat_8 = this.ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA");
    }

    getCompositions() {
        const landsatCompositions = this.campaign.compositions.find(comp => { return comp.satelliteId === 1 });
        this.compositions = landsatCompositions.colors;
    }

    getWRS(feature){
        return this.ee.Feature(feature).get('PR')
    }

    getTiles() {
        const countries = this.ee.FeatureCollection("users/lapig/countries")
        const wrs = this.ee.FeatureCollection("users/lapig/WRS2")

        const selectedCountry = this.ee.Feature(countries.filter(this.ee.Filter.eq('ISO', this.country)).first())

        const wrs_filtered = wrs.filterBounds(selectedCountry.geometry())

        const wrs_list = wrs_filtered.toList(wrs_filtered.size())

        return  wrs_list.map(this.getWRS)
    }

    getBestImg(satellite, year, mDaysStart, mDaysEnd, path, row) {
        let collection = '';
        let bands      = '';
        const dtStart  = year + mDaysStart;
        const dtEnd    = year + mDaysEnd

        switch (satellite) {
            case 'L8':
                collection = this.landsat_8;
                bands = ['B5','B6','B4']
                break;
            case 'L5':
                collection = this.landsat_5;
                bands = ['B4','B5','B3']
                break;
            case 'L7':
                collection = this.landsat_7
                bands = ['B4','B5','B3']
                break;
        }

        const bestImg = collection.filterDate(dtStart,dtEnd)
            .filterMetadata('WRS_PATH','equals',path)
            .filterMetadata('WRS_ROW','equals',row)
            .sort("CLOUD_COVER")
            .select(bands,['NIR','SWIR','RED'])
            .first()

        return ee.Image(bestImg)
   }

    getBestMosaic(tiles, satellite, year, dtStart, dtEnd) {
        const images = [];
        tiles.forEach(tile => {
            const path = tile.slice(0, 3);
            const row = tile.slice(3, 6);
            const bestImg = this.getBestImg(satellite, year, dtStart, dtEnd, path, row)
            images.push(bestImg);
        });

        const imageCollection = this.ee.ImageCollection.fromImages(images);

        return imageCollection.mosaic()
    }

    publishImg(image, callbackMapId) {
        image.getMapId({ "bands": this.compositions}, callbackMapId)
    }
}