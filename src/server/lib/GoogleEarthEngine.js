const ee = require('@google/earthengine');
const { PrismaClient } = require('@prisma/client')
import { mongo } from "./Mongo";

export class GoogleEarthEngine {
    constructor(campaign) {
        GoogleEarthEngine.prototype.campaign = campaign;
        GoogleEarthEngine.prototype.ee = ee;
        GoogleEarthEngine.prototype.prisma = new PrismaClient();
        GoogleEarthEngine.prototype.credentials = this.deserializeCredentials()
    }

    async db() {
        await mongo.connect();
        return await mongo.db(process.env.MONGO_DATABASE);
    }

    deserializeCredentials() {
        let key = null;
        this.campaign.UsersOnCampaigns.forEach((campUser) => {
            if (campUser.typeUserInCampaign === 'ADMIN') {
                key =  JSON.parse(campUser.user.geeKey);
            }
        })
        return key;
    }

    getRegionFeatures() {
        const countries = this.ee.FeatureCollection("users/lapig/countries");
        const dataset = this.ee.FeatureCollection("FAO/GAUL/2015/level2");
        const selectedCountry = this.ee.Feature(countries.filter(this.ee.Filter.eq('ISO', this.campaign.country)).first());
        return dataset.filterBounds(selectedCountry.geometry());
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
            const self = this;
            const isFrom = points[0].hasOwnProperty('_id') ? 'mongo' : 'prisma';
            const att = attributes[isFrom];
            points.forEach(function (point) {
                features.push(
                    self.ee.Feature(self.ee.Geometry.Point([parseFloat(point[att.lon]), parseFloat(point[att.lat])])).set('_id', point[att.id])
                );
            });
        }
        return this.ee.FeatureCollection(features);
    }

    pointsInfo(points) {
        const self = this;
        const pts = this.toFeatureCollection(points);
        const regionFeatures = this.getRegionFeatures();

        return pts.map(function(point){
            const feat = self.ee.Feature(point);
            const pointGeom = feat.geometry();
            const region = regionFeatures.filterBounds(pointGeom).first();
            return point.set('region', region) ;
        });
    }

    pointsPathRow(points) {
        const self = this;
        const pts = this.toFeatureCollection(points);
        const tiles = this.ee.FeatureCollection("users/lapig/WRS2");

        return pts.map(function(point){
            const feat = self.ee.Feature(point);
            const pointGeom = feat.geometry();
            const tile = tiles.filterBounds(pointGeom).first();
            return point.set('path', self.ee.String(tile.get('PATH'))).set('row', self.ee.String(tile.get('ROW')));
        });
    }

    run(callback, errorCallback, authenticationErrorCallback) {
        this.ee.data.authenticateViaPrivateKey(
            this.credentials,
            () => {this.ee.initialize(null, null, callback, errorCallback) },
            authenticationErrorCallback
        );
    }
}