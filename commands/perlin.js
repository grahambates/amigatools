// https://codepen.io/OliverBalfour/post/procedural-generation-part-1-1d-perlin-noise

const formatTable = require("../helpers/formatTable");
const formatBin = require("../helpers/formatBin");

const command = "perlin [outFile]";
const description = "Generate 1D perlin noise table";

const args = (yargs) => {
  yargs.positional("outFile", {
    type: "string",
    describe: "Output file",
  });
  // Options:
  yargs.option("steps", {
    alias: "s",
    type: "number",
    default: 1024,
    describe: "Number of steps",
  });
  yargs.option("amp", {
    alias: "a",
    type: "number",
    default: 127.5,
    describe: "amplitude of wave",
  });
  yargs.option("wl", {
    alias: "w",
    type: "number",
    default: 16,
    describe: "the distance from the peak of one wave to the next",
  });
  yargs.option("octaves", {
    alias: "o",
    type: "number",
    default: 2,
    describe: "number of octaves of noise to combine",
  });
  yargs.option("divisor", {
    alias: "dv",
    type: "number",
    default: 2,
    describe: "divisor between octaves",
  });
  yargs.option("unsigned", {
    alias: "u",
    type: "boolean",
    default: false,
    describe: "Range 0 to amp instead of 0+-amp",
  });
  yargs.option("size", {
    alias: "z",
    choices: ["b", "w", "l"],
    describe: "Value size byte/word/long (default: auto)",
  });
  yargs.option("binary", {
    alias: "b",
    type: "boolean",
    default: false,
    describe: "Output binary file",
  });
  // Source output options:
  yargs.option("label", {
    alias: "l",
    default: "Perlin",
    describe: "Label in source output",
  });
  yargs.option("rowSize", {
    alias: "r",
    default: 8,
    describe: "Values per row in source output",
  });
  yargs.option("decimal", {
    alias: "d",
    type: "boolean",
    default: false,
    describe: "Output in values in decimal format, rather than hex",
  });
};

const handler = function ({
  steps,
  amp,
  unsigned,
  size,
  binary,
  label,
  rowSize,
  decimal,
  outFile,
}) {
  const wl = 16;
  const octaves = 2;
  const divisor = 2;
  let origin = 0;

  if (unsigned) {
    origin = amp / 2;
    amp /= 2;
  }

  if (!size) {
    size = amp < 0x80 ? "b" : amp < 0x8000 ? "w" : "l";
  }

  const values = combineNoise(
    generateNoise(amp, wl, octaves, divisor, steps)
  ).map((n) => Math.round(n + origin));

  const tblOpts = {
    hex: !decimal,
    size,
    label,
    rowSize,
  };

  if (outFile) {
    console.log(`Writing to file '${outFile}'`);
    const output = binary
      ? formatBin(values, { size })
      : formatTable(values, tblOpts);
    fs.writeFileSync(outFile, output);
  } else {
    console.log(formatTable(values, tblOpts));
  }
};

module.exports = [command, description, args, handler];

// Linear congruential generator parameters
const M = 4294967296;
const A = 1664525;
const C = 1;

// Psuedo-random number generator (linear congruential)
function psng() {
  let z = Math.floor(Math.random() * M);
  return () => {
    z = (A * z + C) % M;
    return z / M - 0.5;
  };
}

// Cosine interpolation
function interpolate(pa, pb, px) {
  const ft = px * Math.PI;
  const f = (1 - Math.cos(ft)) * 0.5;
  return pa * (1 - f) + pb * f;
}

// 1D perlin line generator
function perlin(amp, wl, width) {
  let x = 0;
  const p = psng();
  let a = p();
  let b = p();
  const pos = [];
  while (x < width) {
    if (x % wl === 0) {
      a = b;
      b = p();
      pos.push(a * amp);
    } else {
      pos.push(interpolate(a, b, (x % wl) / wl) * amp);
    }
    x++;
  }
  return pos;
}

// Octave generator
function generateNoise(amp, wl, octaves, divisor, width) {
  const result = [];
  for (var i = 0; i < octaves; i++) {
    result.push(perlin(amp, wl, width));
    amp /= divisor;
    wl /= divisor;
  }
  return result;
}

// Combines octaves together
function combineNoise(pl) {
  const result = [];
  for (let i = 0; i < pl[0].length; i++) {
    let total = 0;
    for (let j = 0; j < pl.length; j++) {
      total += pl[j][i];
    }
    result.push(total);
  }
  return result;
}
