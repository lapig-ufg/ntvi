#!/usr/bin/python3

import sys
import ee
import json
import datetime
import traceback
import glob
import calendar
import os
import numpy as np
from os.path import join, dirname, abspath
from dotenv import load_dotenv
from pymongo import MongoClient
from datetimerange import DateTimeRange
from datetime import datetime, timedelta, date

dotenv_path = join(dirname(dirname(dirname(abspath(__file__)))), '.env')
load_dotenv(dotenv_path)

DATA_KEY = sys.argv[1]
data = json.loads(DATA_KEY)

MONGO_HOST = os.environ.get("MONGO_HOST")
MONGO_PORT = int(os.environ.get("MONGO_PORT"))
MONGO_DATABASE = os.environ.get("MONGO_DATABASE")

CAMPAIGN = data['campaign']
SATELLITE = "S2"
BANDS= data['compositions']
REGIONS_NAMES = data['region']
INITIAL_YEAR = int(data['initialYear'])
FINAL_YEAR = int(data['finalYear'])

EE_ACCOUNT = data['client_email']
EE_CREDENTIALS = ee.ServiceAccountCredentials(EE_ACCOUNT, None, DATA_KEY)

FOREST = ['RED', 'GREEN', 'BLUE']
DRYREGIONS = ['NIR', 'RED', 'GREEN']
AGRICULTURALAREAS = ['REDEDGE4', 'SWIR1', 'REDEDGE1']

print("BANDS: ", BANDS)

def getMin():
    min = [0.0]
    if np.array_equal(FOREST, BANDS):
        min = [200,300,700]
    elif np.array_equal(DRYREGIONS, BANDS):
        min = [1100,700,600]
    elif np.array_equal(AGRICULTURALAREAS, BANDS):
        min = [1700,700,600]
    return min

def getMax():
    max = [0.0]
    if np.array_equal(FOREST,BANDS):
        max = [3000,2500,2300]
    elif np.array_equal(DRYREGIONS,BANDS):
        max = [4000,2800,2400]
    elif np.array_equal(AGRICULTURALAREAS,BANDS):
        max = [4600,5000,2400]
    return max

def getGamma():
    gamma = [1.35]
    if np.array_equal(FOREST, BANDS):
        gamma = [1.35]
    elif np.array_equal(DRYREGIONS, BANDS):
        gamma =  [1.1]
    elif np.array_equal(AGRICULTURALAREAS, BANDS):
        gamma = [0.8]
    return gamma

def getTimeList():
    """
    Get a list of time parameters
    :return: date_range_list -->list
    """

    today = datetime.today()

    startdate = '2015-01-01'
    enddate = str(today.year - 1) + '-12-31'

    date_range_list = []

    startdate = datetime.strptime(startdate, '%Y-%m-%d')
    enddate = datetime.strptime(enddate, '%Y-%m-%d') + timedelta(days=1)

    while 1:
        next_month = startdate + timedelta(days=calendar.monthrange(startdate.year, startdate.month)[1])
        month_end = next_month - timedelta(days=1)

        period = ''
        dryPeriod = DateTimeRange(str(startdate.year)+"-06-01 00:00:00", str(startdate.year)+"-10-31 00:00:00")
        wetPeriod = DateTimeRange(str(startdate.year)+"-01-01 00:00:00", str(startdate.year)+"-04-30 00:00:00")

        if startdate in wetPeriod:
            period = 'WET'

        else:

            if startdate in dryPeriod:
                period = 'DRY'


        if month_end < enddate:
            date_range_list.append(
                    {
                        "label_month": datetime.strftime(startdate,'%m/%Y'),
                        "month": datetime.strftime(startdate,'%m_%Y'),
                        "period": period,
                        "start": datetime.strftime(startdate,'%Y-%m-%d'),
                        "end": datetime.strftime(month_end,'%Y-%m-%d')
                    }
                )
            startdate = next_month
        else:
            return date_range_list

def getBestImg(regionBounds, date):
    collection = ee.ImageCollection("COPERNICUS/S2")

    bestImg = collection.filterBounds(regionBounds) \
        .filterDate(date['start'], date['end']) \
        .sort("CLOUDY_PIXEL_PERCENTAGE", False) \
        .select(['B2','B3','B4','B5','B6','B7','B8','B8A','B11','B12'], ['BLUE','GREEN','RED','REDEDGE1','REDEDGE2','REDEDGE3','NIR','REDEDGE4','SWIR1','SWIR2']) \
        .mosaic()


    return ee.Image(bestImg)

def getRegionBounds(regionsNames):
    regions = ee.FeatureCollection("users/lapig/countries")

    query = ee.Filter.inList('ISO', regionsNames)
    selectedCountries = ee.Feature(regions.filter(query))
    selectedRegion =  ee.FeatureCollection(selectedCountries).flatten()
    bounds = selectedRegion.geometry()

    return bounds

def getBestMosaic(bounds, date):
    images = []
    bestImg = getBestImg(bounds, date)
    images.append(bestImg)
    imageCollection = ee.ImageCollection.fromImages(images)
    mosaic = imageCollection.mosaic()
    return mosaic

def publishImg(image):
#     print(getMin())
#     print(getMax())
#     print(getGamma())
    mapId = image.getMapId({ "bands": BANDS, "min": getMin(), "max": getMax(), "gamma": getGamma()})

    mapUrl = mapId['tile_fetcher'].url_format

    for i in mapId:

        if(i == u'token'):
            eeToken = str(mapId.get(i))
        elif (i == u'mapid'):
            eeMapid = str(mapId.get(i))

    return eeToken, eeMapid, mapUrl

def getExpirationDate():
	now = datetime.now()
	expiration_datetime = datetime(now.year, now.month, now.day, now.hour, now.minute, now.second) + timedelta(hours=22)
	return expiration_datetime

def saveMosaic(mosaicId, bounds, date):
    bestMosaic = getBestMosaic(bounds, date)
    eeToken, eeMapid, mapUrl = publishImg(bestMosaic)

    expirationDate = getExpirationDate()

    mosaic = {
        "_id": mosaicId,
        "campaignId": CAMPAIGN,
        "date": date,
        "ee_token": eeToken,
        "ee_mapid": eeMapid,
        "url": mapUrl,
        "expiration_date": expirationDate
    }

    db.mosaics.update_one({ "_id": mosaicId, "campaignId": CAMPAIGN }, { "$set": mosaic }, True)
    print(mosaicId)

def processPeriod(regionsNames, periods, suffix = ''):
    bounds = getRegionBounds(regionsNames)
    for date in periods:

        mosaicId = str(CAMPAIGN) + "_" +SATELLITE + "_" + str(date['month'])
        existMosaic = db.mosaics.find_one({ "_id": mosaicId,  "campaign": CAMPAIGN, })
        try:
            if existMosaic != None:
                print(datetime.now().time() > existMosaic['expiration_date'].time())
                if datetime.now().time() > existMosaic['expiration_date'].time():
                    saveMosaic(mosaicId, bounds, date)
                else:
                    print(mosaicId + ' exists and is valid.')
            else:
                saveMosaic(mosaicId, bounds, date)
        except Exception as e:
            print(str(e))
            traceback.print_exc()
            print(mosaicId + ' no image.')


client = MongoClient(MONGO_HOST, MONGO_PORT)
db = client[MONGO_DATABASE]

ee.Initialize(EE_CREDENTIALS)

periods = getTimeList()
processPeriod(REGIONS_NAMES, periods)

ee.Reset()