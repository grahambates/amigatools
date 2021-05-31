const fs = require("fs");

const command = "shiftrgba <inFile> <outFile>";
const description =
  "Converts 4 bit RGBA format output by Imagemagick to RGB by shifting each word >>4";

const args = (yargs) => {
  yargs.positional("inFile", {
    type: "string",
    describe: "RGBA input file",
  });
  yargs.positional("outFile", {
    type: "string",
    describe: "RGB output file",
  });
};

const handler = ({ inFile, outFile }) => {
  const input = fs.readFileSync(inFile);
  const out = Buffer.allocUnsafe(input.length);

  for (let i = 0; i < input.length / 2; i++) {
    const v = input.readUInt16BE(i * 2) >> 4;
    out.writeUInt16BE(v, i * 2);
  }

  console.log(`Writing to file '${outFile}'`);
  fs.writeFileSync(outFile, out);
};

module.exports = [command, description, args, handler];
