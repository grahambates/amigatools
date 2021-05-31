const formatTable = require("../helpers/formatTable");

const command = "scale [outFile]";
const description =
  "Generates a table of columns to remove in order scale an image down horizontally";

const args = (yargs) => {
  yargs.positional("outFile", {
    type: "string",
    describe: "Output file",
  });
  yargs.option("width", {
    alias: "w",
    type: "number",
    default: 320,
    describe: "Original image width",
  });
  yargs.option("size", {
    alias: "z",
    choices: ["b", "w", "l"],
    default: "w",
    describe: "Value size byte/word/long",
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

const handler = ({ width, outFile, size, rowSize, decimal }) => {
  /*
  For each intermediate step from original width to zero, choose a column to remove:

  Uses brute force to find best value:

  - Scale to target width using interpolation for accurate scaled version, using
    floating point
  - For each possible column we could remove, calculate the total deltas of each
    remaining column from the 'ideal' version.
  - Choose the column giving the lowest total delta
  */

  // Index of columns to remove, relative to image at previous step
  const colPositions = [];
  // Absolute index of columns removed at each step, relative to original image
  // We'll need this to scale back up as we splice columns back in from the source
  const srcCols = [];

  // Keep track of remaining columns at each step in order to get relative positions
  const remainingCols = [];
  for (let i = 0; i < width; i++) {
    remainingCols.push(i);
  }

  function idealPos(targetWidth) {
    const positions = [];
    const inc = width / targetWidth;
    for (let i = 0; i < targetWidth; i++) {
      positions.push(inc * i);
    }
    return positions;
  }

  function totalDelta(candidate, ideal) {
    let total = 0;
    for (let i = 0; i < candidate.length; i++) {
      total += Math.abs(candidate[i] - ideal[i]);
    }
    return total;
  }

  function findBest(start, end) {
    const ideal = idealPos(remainingCols.length - 1);
    const deltas = [];
    for (let i = start; i < end; i++) {
      const candidate = remainingCols.slice();
      candidate.splice(i, 1);
      deltas.push(totalDelta(candidate, ideal));
    }
    const minDelta = Math.min(...deltas);
    const bestIdx = deltas.indexOf(minDelta) + start;
    return bestIdx;
  }

  for (let i = 0; i < width; i++) {
    const mid = Math.ceil(remainingCols.length / 2);
    const idx = i % 2 ? findBest(0, mid) : findBest(mid, remainingCols.length);
    colPositions.push(idx);
    srcCols.push(remainingCols[idx]);
    remainingCols.splice(idx, 1);
  }

  const tblOpts = {
    hex: !decimal,
    size,
    rowSize,
  };

  let output =
    formatTable(colPositions, { ...tblOpts, label: "ColPositions" }) + "\n";
  output += formatTable(srcCols, { ...tblOpts, label: "SrcCols" });

  if (outFile) {
    console.log(`Writing to file '${outFile}'`);
    fs.writeFileSync(outFile, output);
  } else {
    console.log(output);
  }
};

module.exports = [command, description, args, handler];
