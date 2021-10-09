#!/bin/bash

version=`node -e 'console.log(require("./manifest.json").version)'`
filename="ptt-imgur.$version.zip"

zip $filename manifest.json *.js icon/*.png
