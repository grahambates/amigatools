const fs = require("fs");
const formatBin = require("../helpers/formatBin");
const formatTable = require("../helpers/formatTable");

const command = "sin [outFile]";
const description = "Generate sin table";

const args = (yargs) => {
  yargs.positional("outFile", {
    type: "string",
    describe: "Output file",
  });
  // Options:
  yargs.option("steps", {
    alias: "s",
    type: "number",
    default: 256,
    describe: "Number of steps",
  });
  yargs.option("amp", {
    alias: "a",
    type: "number",
    default: 127.5,
    describe: "amplitude",
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
  yargs.option("cos", {
    alias: "c",
    type: "boolean",
    default: false,
    describe: "Include cosine",
  });
  // Source output options:
  yargs.option("label", {
    alias: "l",
    default: "Sin",
    describe: "Label in source output",
  });
  yargs.option("cosLabel", {
    alias: "cl",
    default: "Cos",
    describe: "Cosine label in source output",
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
  cos,
  cosLabel,
  rowSize,
  decimal,
  outFile,
}) {
  let values = [];
  const step = (Math.PI * 2) / steps;
  let origin = 0;

  if (unsigned) {
    origin = amp / 2;
    amp /= 2;
  }

  if (!size) {
    size = amp < 0x80 ? "b" : amp < 0x8000 ? "w" : "l";
  }

  for (let i = 0; i < steps; i++) {
    const sin = Math.sin(step * i);
    const value = Math.round(sin * amp + origin);
    values.push(value);
  }

  let tblOutput;
  const tblOpts = {
    hex: !decimal,
    size,
    label,
    rowSize,
  };

  if (cos) {
    const cosStrt = values.length / 4;
    const q1 = values.slice(0, cosStrt);
    values = [...values, ...q1];

    tblOutput = formatTable(q1, tblOpts) + "\n";
    tblOutput += formatTable(values.slice(cosStrt), {
      ...tblOpts,
      label: cosLabel,
    });
  } else {
    tblOutput = formatTable(values, tblOpts);
  }

  if (outFile) {
    console.log(`Writing to file '${outFile}'`);
    const output = binary ? formatBin(values, { size }) : tblOutput;
    fs.writeFileSync(outFile, output);
  } else {
    console.log(tblOutput);
  }
};

module.exports = [command, description, args, handler];
