#!/usr/bin/python3

import sys
import ee
import json
import datetime
import traceback
import glob
import calendar
import os
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

SATELLITE = "COPERNICUS_S2_SR"
BANDS= data['compositions']
REGIONS_NAMES = data['region']
INITIAL_YEAR = int(data['initialYear'])
FINAL_YEAR = int(data['finalYear'])

EE_ACCOUNT = data['client_email']
EE_CREDENTIALS = ee.ServiceAccountCredentials(EE_ACCOUNT, None, DATA_KEY)

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
# Function to mask clouds S2


def maskS2srClouds(image):
    qa = image.select('QA60')

    # Bits 10 and 11 are clouds and cirrus, respectively.
    cloudBitMask = 1 << 10
    cirrusBitMask = 1 << 11

    # Both flags should be set to zero, indicating clear conditions.
    mask = qa.bitwiseAnd(cloudBitMask).eq(0).And(qa.bitwiseAnd(cirrusBitMask).eq(0))

    return image.updateMask(mask).divide(10000)

def getBestImg(regionBounds, date):
    collection = ee.ImageCollection("COPERNICUS/S2_SR")
    bands = ['B4','B3','B2']

    bestImg = collection.filterBounds(regionBounds).filterDate(date['start'],date['end']).filterMetadata('CLOUDY_PIXEL_PERCENTAGE','less_than',10).map(maskS2srClouds)

    composition = bestImg.median().clip(regionBounds)
    return ee.Image(composition)

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

	mapId = image.getMapId({ "bands": 'B4,B3,B2', "min": 0.02, "max": 0.3, "gamma": 1.5})
	
	mapUrl = mapId['tile_fetcher'].url_format

	for i in mapId:
		
		if(i == u'token'):
			eeToken = str(mapId.get(i))
		elif (i == u'mapid'):
			eeMapid = str(mapId.get(i))

	return eeToken, eeMapid, mapUrl

def getExpirationDate():
	now = datetime.now()
	expiration_datetime = datetime(now.year, now.month, now.day) + timedelta(hours=24)
	return expiration_datetime

def processPeriod(regionsNames, periods, suffix = ''):
    bounds = getRegionBounds(regionsNames)
    for date in periods:

        mosaicId = CAMPAIGN +"_"+SATELLITE + "_" + str(date['month'])
        existMosaic = db.mosaics.find_one({ "_id": mosaicId,  "campaign": CAMPAIGN, })

        if existMosaic == None or datetime.now() > existMosaic['expiration_datetime']:
            try:
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
                    "expiration_datetime": expirationDate
                }

                db.mosaics.update_one({ "_id": mosaicId, "campaign": CAMPAIGN }, { "$set": mosaic }, True)
                print(mosaic)
            except:
                traceback.print_exc()
        else:
            print('mosaic exists and is valid.')

client = MongoClient(MONGO_HOST, MONGO_PORT)
db = client[MONGO_DATABASE]

ee.Initialize(EE_CREDENTIALS)

periods = getTimeList()
processPeriod(REGIONS_NAMES, periods)

ee.Reset()