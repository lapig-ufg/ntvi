#!/bin/bash

TMS_URL="$1"
POINT="$2"
ZOOM="$3"
IMAGE_FILE="$4"

BASEDIR=$(dirname "$0")

STITCH_PARAMS="-c -- $POINT 300 300 $ZOOM $TMS_URL"

mkdir -p $(dirname $IMAGE_FILE)

# uncomment for debug
#echo "COMMAND: stitch -o -w $IMAGE_FILE $STITCH_PARAMS "

stitch -o $IMAGE_FILE $STITCH_PARAMS
python3 $BASEDIR/enhance_img_clahe.py $IMAGE_FILE