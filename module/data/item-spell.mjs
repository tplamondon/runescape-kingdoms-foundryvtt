import RunescapeKingdomsItemBase from "./base-item.mjs";

export default class RunescapeKingdomsSpell extends RunescapeKingdomsItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.spellType = new fields.StringField({ required: true, initial: "utility" });

    return schema;
  }
}
