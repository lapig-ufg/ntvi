import numpy as np
import cv2
import sys

def adjust_gamma(image, gamma=1.0):

   invGamma = 1.0 / gamma
   table = np.array([((i / 255.0) ** invGamma) * 255
      for i in np.arange(0, 256)]).astype("uint8")

   return cv2.LUT(image, table)

def enhance_img(data):

	r, g, b = cv2.split(data)

	limg = cv2.merge((r, g, b))
	limg = adjust_gamma(limg, 1.35)

	hsvImg = cv2.cvtColor(limg,cv2.COLOR_BGR2HSV)
	hsvImg[...,1] = hsvImg[...,1]*1.15
	limg=cv2.cvtColor(hsvImg,cv2.COLOR_HSV2BGR)

	return limg

def read_img(filename):
	return cv2.imread(filename)

def write_img(filename, data):
	cv2.imwrite(filename, data)

if __name__ == "__main__":

	filename1=sys.argv[1]

	data1 = read_img(filename1)
	data1 = enhance_img(data1)

	write_img(filename1, data1)