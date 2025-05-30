/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    "systems/runescape-kingdoms/templates/actor/parts/actor-features.hbs",
    "systems/runescape-kingdoms/templates/actor/parts/actor-backgrounds.hbs",
    "systems/runescape-kingdoms/templates/actor/parts/actor-items.hbs",
    "systems/runescape-kingdoms/templates/actor/parts/actor-spells.hbs",
    "systems/runescape-kingdoms/templates/actor/parts/actor-prayers.hbs",
    "systems/runescape-kingdoms/templates/actor/parts/actor-effects.hbs",
    // Item partials
    "systems/runescape-kingdoms/templates/item/parts/item-effects.hbs",
    // chat partials
    "systems/runescape-kingdoms/templates/chat/parts/roll-base.hbs",
  ]);
};
