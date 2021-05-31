#!/bin/bash -e

IN="${@: -1}"
WIDTH=80
DEPTH=4

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

function usage {
  echo "Usage: $(basename $0) [-w WIDTH] input" 2>&1
  echo 'Convert image to chunky pixel data'
  echo '   -w WIDTH        Specify the image width in px'
  exit 1
}

while getopts ":w:b:d:" arg; do
  case "${arg}" in
    w) WIDTH="${OPTARG}"
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
RGBAOUT="${BASE}-${WIDTH}-4.rgba"
RGBOUT="${BASE}-${WIDTH}-4.rgb"

convert "$IN" -resize $WIDTH -depth 4 "$RGBAOUT"

node ${SCRIPT_DIR}/../amigatools shiftrgba "${RGBAOUT}" "${RGBOUT}"
rm ${RGBAOUT}
