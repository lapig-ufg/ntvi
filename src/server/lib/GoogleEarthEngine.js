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

    run(callback, errorCallback, authenticationErrorCallback) {
        ee.data.authenticateViaPrivateKey(
            this.credentials,
            () => { ee.initialize(null, null, callback, errorCallback) },
            authenticationErrorCallback
        );
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
        let attributes = {
            prisma: {
                lat: 'latitude',
                lon: 'longitude',
                id: 'id'
            },
            mongo: {
                lat: 'lat',
                lon: 'lon',
                id: '_id'
            }
        };

        if(Array.isArray(points)){
            const isFrom = points[0].hasOwnProperty('_id') ? 'mongo' : 'prisma';
            const att = attributes[isFrom];
            points.forEach(function (point) {
                features.push(
                    ee.Feature(ee.Geometry.Point([parseFloat(point[att.lon]), parseFloat(point[att.lat])])).set('_id', point[att.id])
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
    pointsPathRow(points) {
        const pts = this.toFeatureCollection(points);
        const tiles = ee.FeatureCollection("users/lapig/WRS2");

        return pts.map(function(point){
            const feat = ee.Feature(point);
            const pointGeom = feat.geometry();
            const tile = tiles.filterBounds(pointGeom).first();
            return point.set('path', ee.String(tile.get('PATH'))).set('row', ee.String(tile.get('ROW')));
        });
    }
}