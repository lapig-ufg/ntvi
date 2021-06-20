import { GoogleEarthEngine } from "./GoogleEarthEngine";

export class Landsat extends GoogleEarthEngine {
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
        ]

    }

    getWRS(feature){
        this.landsat_5 = this.ee.ImageCollection("LANDSAT/LT05/C01/T1_TOA");
        this.landsat_7 = this.ee.ImageCollection("LANDSAT/LE07/C01/T1_TOA");
        this.landsat_8 = this.ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA");
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


}