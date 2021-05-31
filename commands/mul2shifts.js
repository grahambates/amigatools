const command = "mul2shifts <multiplier>";
const description = "Convert multiplication by constant to shifts/addition";

const args = (yargs) => {
  yargs.positional("multiplier", {
    type: "number",
    describe: "Constant multiplier",
  });
};

function shifts(num) {
  const steps = [];
  let total = 0;
  while (total !== num) {
    const delta = num - total;
    const dir = delta > 0 ? 1 : -1;
    const shift = Math.round(Math.log(delta * dir) / Math.log(2));
    total += dir << shift;
    steps.push([shift, dir]);
  }
  return steps;
}

const handler = ({ multiplier }) => {
  const steps = shifts(multiplier);

  let output = "";
  for (const [shift, dir] of steps) {
    if (output) {
      output += dir > 0 ? " + " : " - ";
    }
    output += "x";
    if (shift) {
      output += "<<" + shift;
    } else {
    }
  }
  console.log(output);
  console.log("");

  if (steps.length > 1) {
    console.log("  move d0,d1");
  }

  const first = steps.shift();
  console.log(`  lsl  #${first[0]},d0`);
  if (first[1] < 0) {
    console.log(`  neg  d0`);
  }

  steps.reverse();
  let curr = 0;
  for (const [shift, dir] of steps) {
    if (shift) {
      console.log(`  lsl  #${shift - curr},d1`);
      curr += shift;
    }
    console.log(`  ${dir > 0 ? "add" : "sub"}  d1,d0`);
  }
};

module.exports = [command, description, args, handler];
