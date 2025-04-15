import RunescapeKingdomsItemBase from "./base-item.mjs";

export default class RunescapeKingdomsPrayer extends RunescapeKingdomsItemBase {
  // enable/disable similar to equipping items like DND?

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    // Iterate over attribute names and create a new SchemaField for each.
    schema.enabled = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.turns = new fields.StringField({ required: true, blank: true });

    return schema;
  }

  prepareDerivedData() {}
}
