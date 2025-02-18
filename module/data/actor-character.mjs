import RunescapeKingdomsActorBase from "./base-actor.mjs";

export default class RunescapeKingdomsCharacter extends RunescapeKingdomsActorBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const attributeInteger = { initial: 1, min: 1, max: 8 };
    const skillInteger = { initial: 1, min: 1, max: 10 };
    const schema = super.defineSchema();

    // Iterate over attribute names and create a new SchemaField for each.
    schema.attributes = new fields.SchemaField(
      Object.keys(CONFIG.RUNESCAPE_KINGDOMS.attributes).reduce((obj, attribute) => {
        obj[attribute] = new fields.SchemaField({
          value: new fields.NumberField({ ...requiredInteger, ...attributeInteger }),
        });
        return obj;
      }, {})
    );

    //iterate over skill names and create a new SchemaField for each
    schema.skills = new fields.SchemaField(
      Object.keys(CONFIG.RUNESCAPE_KINGDOMS.skills).reduce((obj, skill) => {
        obj[skill] = new fields.SchemaField({
          value: new fields.NumberField({ ...requiredInteger, ...skillInteger }),
        });
        return obj;
      }, {})
    );

    return schema;
  }

  // this function is called whenever the sheet is updated as well it seems
  prepareDerivedData() {
    let hpMax = 0;
    // Loop through attributes scores, and add stuff to our sheet output such as label
    // not going to use mod (.mod) as this game doesn't have that like DnD, and it would just be the value anyways
    for (const key in this.attributes) {
      // add to hpMax
      hpMax += this.attributes[key].value;
      // Handle attributes label localisation.
      this.attributes[key].label =
        game.i18n.localize(CONFIG.RUNESCAPE_KINGDOMS.attributes[key]) ?? key;
    }
    for (const key in this.skills) {
      // add to hpmax
      hpMax += this.skills[key].value;
      // Handle skill label localisation
      game.i18n.localize(CONFIG.RUNESCAPE_KINGDOMS.skills[key]) ?? key;
    }

    // adjust health
    // max health should be attribute total + skill total for charactors
    this.health.max = hpMax;
  }

  getRollData() {
    const data = {};

    // Copy the attributes scores to the top level, so that rolls can use
    // formulas like `@str.value + 4`.
    if (this.attributes) {
      for (let [k, v] of Object.entries(this.attributes)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }
    if (this.skills) {
      for (let [k, v] of Object.entries(this.skills)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    return data;
  }
}
