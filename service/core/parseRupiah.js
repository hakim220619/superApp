function parseRupiah(rp) {
  if (typeof rp === "number") return rp;
  return parseFloat(rp.replace(/[^0-9,-]+/g, "").replace(",", ".")) || 0;
}

module.exports = parseRupiah;
