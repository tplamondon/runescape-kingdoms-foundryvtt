import RunescapeKingdomsActorBase from "./base-actor.mjs";

export default class RunescapeKingdomsCharacter extends RunescapeKingdomsActorBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const attributeInteger = { initial: 1, min: 1, max: 8 };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      }),
    });

    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(
      Object.keys(CONFIG.RUNESCAPE_KINGDOMS.abilities).reduce((obj, ability) => {
        obj[ability] = new fields.SchemaField({
          value: new fields.NumberField({ ...requiredInteger, ...attributeInteger }),
        });
        return obj;
      }, {})
    );

    return schema;
  }

  prepareDerivedData() {
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.abilities) {
      // Calculate the modifier using d20 rules.
      // this.abilities[key].mod = Math.floor((this.abilities[key].value - 10) / 2);
      this.abilities[key].mod = this.abilities[key].value;
      // Handle ability label localization.
      this.abilities[key].label =
        game.i18n.localize(CONFIG.RUNESCAPE_KINGDOMS.abilities[key]) ?? key;
    }
  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k, v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;

    return data;
  }
}
