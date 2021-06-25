#!/usr/bin/python3
import sys
import ee
import os
import json
import datetime
import traceback
import glob
from pymongo import MongoClient, UpdateOne
from pymongo.errors import BulkWriteError
from os.path import join, dirname, abspath
from dotenv import load_dotenv

dotenv_path = join(dirname(dirname(dirname(abspath(__file__)))), '.env')
load_dotenv(dotenv_path)

DATA_KEY = sys.argv[1]

data = json.loads(DATA_KEY)

MONGO_HOST = os.environ.get("MONGO_HOST")
MONGO_PORT = int(os.environ.get("MONGO_PORT"))
MONGO_DATABASE = os.environ.get("MONGO_DATABASE")

CAMPAIGN = data['campaign']
BANDS= data['compositions']
REGIONS_NAMES = data['region']
INITIAL_YEAR = int(data['initialYear'])
FINAL_YEAR = int(data['finalYear'])

EE_ACCOUNT = data['client_email']
EE_CREDENTIALS = ee.ServiceAccountCredentials(EE_ACCOUNT, None, DATA_KEY)

SATELLITES = [ 'L8', 'L7', 'L5' ]

PERIODS_BR = [
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

client = MongoClient(MONGO_HOST, MONGO_PORT)
db = client[MONGO_DATABASE]

def getBestImg(satellite, year, mDaysStart, mDaysEnd, path, row):
	dtStart = str(year) + mDaysStart
	dtEnd = str(year) + mDaysEnd

	if satellite == 'L8':
		collection = LANDSAT_8
		bands = ['B5','B6','B4']
	elif satellite == 'L5':
		collection = LANDSAT_5
		bands = ['B4','B5','B3']
	elif satellite == 'L7':
		collection = LANDSAT_7
		bands = ['B4','B5','B3']

	bestImg = collection.filterDate(dtStart,dtEnd) \
										.filterMetadata('WRS_PATH','equals',path)  \
										.filterMetadata('WRS_ROW','equals',row) \
										.sort("CLOUD_COVER") \
										.select(bands,['NIR','SWIR','RED']) \
										.first()

	return ee.Image(bestImg)

def getWRS(feature):
    return ee.Feature(feature).get('PR')

def getWrsCodes(regionsNames):
    ee.Initialize(EE_CREDENTIALS)
    regions = ee.FeatureCollection("users/lapig/countries")
    wrs = ee.FeatureCollection("users/lapig/WRS2")
    query = ee.Filter.inList('ISO', regionsNames)
    selectedCountries = ee.Feature(regions.filter(query))
    selectedRegion =  ee.FeatureCollection(selectedCountries).flatten()

    wrs_filtered = wrs.filterBounds(selectedRegion.geometry())
    wrs_list = wrs_filtered.toList(wrs_filtered.size())

    listWrs = list(wrs_list.map(getWRS).getInfo())
    listWrs.sort()

    ee.Reset()

    return listWrs

def getBestImages(satellite, year, dtStart, dtEnd):
	images = []
	for tile in TILES:
	  path = int(tile[0:3])
	  row = int(tile[3:6])
	  bestImg = getBestImg(satellite, year, dtStart, dtEnd, path, row)

	  images.append({'eeObj': bestImg, 'row': row, 'path':path})

	return images

def getExpirationDate():
	now = datetime.datetime.now()
	return datetime.datetime(now.year, now.month, now.day) + datetime.timedelta(hours=22)

def processPeriod(tiles, periods, suffix = ''):
    for periodDict in periods:

        period = periodDict['name']
        dtStart = periodDict['dtStart']
        dtEnd = periodDict['dtEnd']

        mosaicId = str(CAMPAIGN) + "_" + satellite + "_" + str(year) + "_" + period

        for bestImage in getBestImages(satellite,year,dtStart,dtEnd):
            try:
                print(bestImage)
                date = bestImage['eeObj'].get('DATE_ACQUIRED').getInfo()
                dt = { "dates": { "row": bestImage['row'], "path": bestImage['path'], "date": date  } }
                db.mosaics.update({ "_id": mosaicId, "campaignId": CAMPAIGN }, { "$push": dt }, True)
                print(mosaicId + ' - ' + dt.path+dt.row + ' - ' + dt.date + ' inserted. ')
            except Exception as e:
                pass

TILES = getWrsCodes(REGIONS_NAMES)

for year in range(INITIAL_YEAR,FINAL_YEAR+1):

	ee.Initialize(EE_CREDENTIALS)

	LANDSAT_5 = ee.ImageCollection("LANDSAT/LT05/C01/T1_TOA")
	LANDSAT_7 = ee.ImageCollection("LANDSAT/LE07/C01/T1_TOA")
	LANDSAT_8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA")

	for satellite in SATELLITES:
		if (satellite == 'L8' and year < 2013) or (satellite == 'L5' and year > 2011):
			continue

		if (satellite == 'L7' and year < 2000):
			continue

		processPeriod(TILES, PERIODS_BR)

	ee.Reset()
