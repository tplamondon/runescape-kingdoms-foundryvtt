import RunescapeKingdomsMessageBase from "./base-message.mjs";

export default class RunescapeKingdomsMessagePrayer extends RunescapeKingdomsMessageBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.displayRoll = new fields.BooleanField({
      required: true,
      nullable: false,
      initial: false,
    });

    return schema;
  }

  /** @inheritdoc */
  async alterMessageHTML(html) {
    await super.alterMessageHTML(html);
  }

  /** @inheritdoc */
  addListeners(html) {
    super.addListeners(html);
  }
}
