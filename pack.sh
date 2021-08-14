#!/bin/bash

version=`node -e 'console.log(require("./manifest.json").version)'`
filename="ptt-imgur.$version.zip"

zip $filename background.js manifest.json icon/*.png
