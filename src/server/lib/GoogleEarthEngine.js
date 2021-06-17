const ee = require('@google/earthengine');

export class GoogleEarthEngine {
    credentials;
    country;
    constructor(campaign) {
        this.country = campaign.country;
        this.deserializeCredentials(campaign)
    }

    deserializeCredentials(campaign) {
        campaign.UsersOnCampaigns.forEach((campUser) => {
            if (campUser.typeUserInCampaign === 'ADMIN') {
                this.credentials = JSON.parse(campUser.user.geeKey);
            }
        })
    }

    run(callback, errorCallback) {
        ee.data.authenticateViaPrivateKey(
            this.credentials,
            () => {
                ee.initialize(null, null, callback, errorCallback);
            },
            (err) => {
                console.log(err);
            });
        ee.reset();
    }

    getRegionFeatures() {
        const countries = ee.FeatureCollection("users/lapig/countries");
        const dataset = ee.FeatureCollection("FAO/GAUL/2015/level2");
        const selectedCountry = ee.Feature(countries.filter(ee.Filter.eq('ISO', this.country)).first());
        const regionFeatures = dataset.filterBounds(selectedCountry.geometry());
        return regionFeatures;
    }

    toFeatureCollection(points) {
        let features = [];

        if(Array.isArray(points)){
            points.forEach(function (point) {
                features.push(
                    ee.Feature(ee.Geometry.Point([parseFloat(point.longitude), parseFloat(point.latitude)])).set('point_id', point.id)
                );
            });
        }
        return ee.FeatureCollection(features);
    }

    pointsInfo(points) {
        const pts = this.toFeatureCollection(points);
        const regionFeatures = this.getRegionFeatures();

        return pts.map(function(point){
            const feat = ee.Feature(point);
            const pointGeom = feat.geometry();
            const region = regionFeatures.filterBounds(pointGeom).first();
            return point.set('region', region) ;
        });
    }
}