module.exports = (values, options = {}) => {
  const opts = {
    size: "w",
    ...options,
  };
  const byteLength = byteLengths[opts.size];
  const out = Buffer.allocUnsafe(values.length * byteLength);
  let o = 0;
  for (const v of values) {
    out.writeUIntBE(v, o, byteLength);
    o += byteLength;
  }
  return out;
};

const byteLengths = {
  b: 1,
  w: 2,
  l: 4,
};
