const ee = require('@google/earthengine');
const { PrismaClient } = require('@prisma/client')
import { mongo } from "./Mongo";

export class GoogleEarthEngine {
    credentials;
    campaign;
    ee;
    prisma;

    constructor(campaign) {
        this.campaign = campaign;
        this.deserializeCredentials()
        this.ee = ee;
        this.prisma = new PrismaClient();
    }

    async db() {
        await mongo.connect();
        return await mongo.db(process.env.MONGO_DATABASE);
    }

    deserializeCredentials() {
        this.campaign.UsersOnCampaigns.forEach((campUser) => {
            if (campUser.typeUserInCampaign === 'ADMIN') {
                this.credentials = JSON.parse(campUser.user.geeKey);
            }
        })
    }

    getRegionFeatures() {
        const countries = ee.FeatureCollection("users/lapig/countries");
        const dataset = ee.FeatureCollection("FAO/GAUL/2015/level2");
        const selectedCountry = ee.Feature(countries.filter(ee.Filter.eq('ISO', this.campaign.country)).first());
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

    run(callback, errorCallback, authenticationErrorCallback) {
        ee.data.authenticateViaPrivateKey(
            this.credentials,
            () => { ee.initialize(null, null, callback, errorCallback) },
            authenticationErrorCallback
        );
    }
}