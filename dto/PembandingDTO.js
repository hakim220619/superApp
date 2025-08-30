class PembandingDTO {
  constructor({ fromAccount, toAccount, amount, currency, note }) {
    this.fromAccount = fromAccount || null;
    this.toAccount = toAccount || null;
    this.amount = Number(amount) || 0;
    this.currency = currency || "USD";
    this.note = note || "";
  }
}

const pembanding = new PembandingDTO({});
