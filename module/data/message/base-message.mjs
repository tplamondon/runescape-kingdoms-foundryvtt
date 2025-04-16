import RunescapeKingdomsDataModel from "../base-model.mjs";

export default class RunescapeKingdomsMessageBase extends RunescapeKingdomsDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    // schema.description = new fields.StringField({ required: true, blank: true });

    return schema;
  }

  /**
   *
   * Way to accomplish my goal provided by a member of the foundryvtt discord.
   * Project provided as example: https://github.com/MetaMorphic-Digital/draw-steel
   */

  /**
   * Perform subtype-specific alterations to the final chat message html
   * Called by the renderChatMessageHTML hook
   * @param {HTMLLIElement} html The pending HTML
   */
  async alterMessageHTML(html) {}

  /**
   * Add event listeners. Guaranteed to run after all alterations in {@link alterMessageHTML}
   * Called by the renderChatMessageHTML hook
   * @param {HTMLLIElement} html The pending HTML
   */
  addListeners(html) {}
}
