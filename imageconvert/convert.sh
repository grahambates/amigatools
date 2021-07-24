#!/bin/bash -e

# This is a simple wrapper for ImageMagick and amigeconv https://github.com/tditlu/amigeconv
# It handles my most common use case of scaling, reducing colour depth and
# exporting to RAW image and palette data,

IN="${@: -1}"
WIDTH=320
BPLS=5
DEPTH=4

function usage {
  echo "Usage: $(basename $0) [-w WIDTH] [-b BITPLANES] [-d 4|8] input" 2>&1
  echo 'Convert image to raw format with copper palette'
  echo '   -w WIDTH        Specify the image width in px. Must be multiple of 16'
  echo '   -b [1-8]        Number of bitplanes 1-8'
  echo '   -p [4|8]        Palette depth n bits: 4 or 8'
  exit 1
}

while getopts ":w:b:d:" arg; do
  case "${arg}" in
    w) WIDTH="${OPTARG}"
      ;;
    b) BPLS="${OPTARG}"
      ;;
    d) DEPTH="${OPTARG}"
      ;;
    ?)
      echo "Invalid option: -${OPTARG}."
      echo
      usage
      ;;
  esac
done

BASE=$(basename "$IN" .png)
COLS=$((2**$BPLS))
PNGOUT="${BASE}-${WIDTH}-${COLS}-${DEPTH}.png"
BPLOUT="${BASE}-${WIDTH}-${COLS}-${DEPTH}.raw"
PALOUT="${BASE}-${WIDTH}-${COLS}-${DEPTH}.pal"
COPOUT="${BASE}-${WIDTH}-${COLS}-${DEPTH}.cop"

convert "$IN" -resize $WIDTH -colors $COLS -depth $DEPTH "$PNGOUT"
echo "Saved png to ${PNGOUT}"

amigeconv \
  --format bitplane \
  --depth $BPLS \
  --interleaved \
  "$PNGOUT" "$BPLOUT"
echo "Saved raw bitplane data to ${BPLOUT}"

amigeconv \
  --format palette \
  --palette "pal$DEPTH" \
  --colors $COLS \
  "$PNGOUT" "$PALOUT"
echo "Saved palette to ${PALOUT}"

amigeconv \
  --format palette \
  --palette "pal$DEPTH" \
  --colors $COLS \
  --copper 1 \
  "$PNGOUT" "$COPOUT"
echo "Saved copper palette to ${COPOUT}"
