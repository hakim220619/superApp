// services/rupiah.js
function rupiah(value) {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });
  let formattedValue = formatter.format(value);
  return formattedValue.replace(/\u00A0/g, " ");
}



module.exports = rupiah;
