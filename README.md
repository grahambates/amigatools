# Amiga Tools

A collection of command line helper scripts for Amiga assembly / demo coding.

## Usage:

```
npx amigatools sin [outFile]                 Generate sin table

npx amigatools perlin [outFile]              Generate 1D perlin noise table

npx amigatools mul2shifts <multiplier>       Convert multiplication by constant
                                             to shifts/addition

npx amigatools scale [outFile]               Generates a table of columns to remove
                                             in order scale an image down horizontally

npx amigatools shiftrgba <inFile> <outFile>  Converts 4 bit RGBA format output by
                                             ImageMagick to RGB by shifting each word >>4
```
