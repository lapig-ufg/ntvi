#!/usr/bin/python3
import sys
import os
import imageio
from pathlib import Path
from pygifsicle import optimize
from PIL import Image, ImageFont, ImageDraw

POINT_DIR = sys.argv[1]

image_path = Path(POINT_DIR)
images = list(image_path.glob('*.png'))

def set_label(path):
    label = ""
    strPath = str(path)
    filename = strPath.split('/')[-1] # return filename from array
    im = Image.open(path)
    liberationMono = ImageFont.truetype("LiberationMono-Bold.ttf", 12)
    d = ImageDraw.Draw(im)

    if filename.__contains__('PL') :
        label = filename[5:-4]
    else :
        label =  filename[2:-4]

    text_color = (255, 255, 255)

    width, height = im.size
    x, y          = (width-85, height-20)
    d.text((x, y), label, font=liberationMono, fill=text_color)

    im.save(path)

def main():
    images.sort()
    image_list = []
    for file_name in images:
        set_label(file_name)
        stats = os.stat(file_name)
        if stats.st_size > 1300 and str(file_name).__contains__('PL'):
            image_list.append(imageio.imread(file_name))
    imageio.mimwrite(POINT_DIR + '/timeseries.gif', image_list, fps=5)

    optimize(POINT_DIR + '/timeseries.gif')

if __name__ == "__main__":
    main()