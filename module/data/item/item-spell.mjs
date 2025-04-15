import RunescapeKingdomsItemBase from "./base-item.mjs";

export default class RunescapeKingdomsSpell extends RunescapeKingdomsItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.spellType = new fields.StringField({ required: true, initial: "utility" });
    schema.damageTypes = new fields.SchemaField(
      Object.keys(CONFIG.RUNESCAPE_KINGDOMS.spellDamage).reduce((obj, attribute) => {
        obj[attribute] = new fields.SchemaField({
          value: new fields.NumberField({
            required: true,
            nullable: false,
            integer: true,
            initial: 0,
            min: 0,
          }),
        });
        return obj;
      }, {})
    );

    return schema;
  }

  prepareDerivedData() {
    this.hasDamage =
      this.spellType === "combat" && Object.values(this.damageTypes).some((c) => c.value > 0);
  }
}
