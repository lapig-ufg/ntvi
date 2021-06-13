#!/usr/bin/python3

import sys
import ee
import json
import datetime
import traceback
import glob

CREDENTIALS_DIR = sys.argv[1]
COUNTRY_ISO = sys.argv[2]

def gee_multi_credentials(credentials_dir):
	
	def mpb_get_credentials_path():
		credentials_files = ee.oauth.credentials_files

		if ee.oauth.current_credentials_idx == len(credentials_files):
			ee.oauth.current_credentials_idx = 0
		
		credential = credentials_files[ee.oauth.current_credentials_idx]
		ee.oauth.current_credentials_idx += 1

		print("Acessing GEE from %s" % credential)

		return credential

	ee.oauth.current_credentials_idx = 0
	ee.oauth.credentials_files = glob.glob(credentials_dir+'/*.json')

	ee.oauth.get_credentials_path = mpb_get_credentials_path

def getPoints(countryName):
    countries = ee.FeatureCollection("users/lapig/countries");

    selectedCountry = ee.Feature(countries.filter(ee.Filter.eq('ISO', countryName)).first())
    points = ee.FeatureCollection.randomPoints(selectedCountry.geometry(),5000, 20, 5)

    return points.getInfo()

gee_multi_credentials(CREDENTIALS_DIR)

ee.Initialize()

print(getPoints(COUNTRY_ISO))

ee.Reset()

