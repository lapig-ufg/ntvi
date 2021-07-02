#!/usr/bin/python3
import sys
import os
import re
import imageio
import pprint
from pathlib import Path
from pygifsicle import optimize
from datetime import datetime
from PIL import Image, ImageFont, ImageDraw

POINT_DIR = sys.argv[1]

image_path = Path(POINT_DIR)
images = list(image_path.glob('*.png'))

def getDate(dateString):
    string = str(dateString).split('/')[-1]
    if string.__contains__('L5') or string.__contains__('L7') or string.__contains__('L8'):
        year = string.split('_')[2]
        date = datetime.strptime(year, '%Y').date()
        return date
    else:
        dt = string.split('_')
        dateStr = dt[-1].replace('.png', '') + '-' + dt[2]
        date = datetime.strptime(dateStr, '%Y-%m').date()
        return date

def set_label(path):
    label = ""
    strPath = str(path)
    filename = strPath.split('/')[-1] # return filename from array
    im = Image.open(path)
    ubuntu = ImageFont.truetype("Ubuntu-L.ttf", 11)
    d = ImageDraw.Draw(im)

    if filename.__contains__('PL') :
        label = filename[2:-4]
    else :
        label =  filename[2:-4]

    text_color = (255, 255, 255)

    width, height = im.size
    x, y          = (width-72, height-15)
    d.text((x, y), label, font=ubuntu, fill=text_color)

    im.save(path)

def la_timelapse():
    image_list = []
    for file_name in images:
        stats = os.stat(file_name)
        if stats.st_size > 100000 and (str(file_name).__contains__('L5') or str(file_name).__contains__('L7') or str(file_name).__contains__('L8')):
            image_list.append(imageio.imread(file_name))
    imageio.mimwrite(POINT_DIR + '/la_timelapse.gif', image_list, fps=4)

    optimize(POINT_DIR + '/la_timelapse.gif')

def s2_timelapse():
    image_list = []
    for file_name in images:
        stats = os.stat(file_name)
        if stats.st_size > 100000 and str(file_name).__contains__('S2'):
            image_list.append(imageio.imread(file_name))
    imageio.mimwrite(POINT_DIR + '/s2_timelapse.gif', image_list, fps=4)

    optimize(POINT_DIR + '/s2_timelapse.gif')

def pl_timelapse():
    image_list = []
    for file_name in images:
        stats = os.stat(file_name)
        if stats.st_size > 100000 and str(file_name).__contains__('PL'):
            image_list.append(imageio.imread(file_name))
    imageio.mimwrite(POINT_DIR + '/pl_timelapse.gif', image_list, fps=4)

    optimize(POINT_DIR + '/pl_timelapse.gif')

if __name__ == "__main__":
    images.sort(key=lambda date: getDate(date))
    for file_name in images:
        set_label(file_name)

    la_timelapse()
    pl_timelapse()
    s2_timelapse()