import { RUNESCAPE_KINGDOMS as CONFIG } from "./config.mjs";
import { isCritical } from "./rollHelpers.mjs";

/**
 * @typedef {Object} ChatDataObject
 * @property {Object} rollData.speaker the speaker
 * @property {string} rollData.rollTitle the localised name for the chat title
 * @property {boolean} rollData.isSuccess if roll was a success
 * @property {boolean} rollData.isCritical if it was a critical
 * @property {string} rollData.attributeKey the attribute key. RUNESCAPE_KINGDOMS.attributes in config.mjs
 * @property {Object} rollData.config CONFIG.RUNESCAPE_KINGDOMS (easier to get from outside the function)
 * @property {Object} rollData.extra Extra information to pass to the sheet template (type specific generally)
 * @property {RollObject} rollData.roll The main roll used
 */

/**
 * @typedef {Object} RollObject
 * @property {number} result the total result
 * @property {number} bonus the bonus/modifier to the dice roll
 * @property {number} dice the die array
 * @property {number} target the target to get <=
 * @property {Roll} roll the roll object
 * @property {string} resultRender the rendered html
 */

/**
 *
 * @param {Object} roll roll object
 * @param {Object} rollDialogue dialoguev2 from roll
 * @param {Number} rollTarget the target
 * @returns {RollObject}
 */
async function rollToChatRollObject(roll, rollDialogue, rollTarget) {
  return {
    result: roll.total,
    bonus: rollDialogue.bonus,
    dice: roll.terms.find((c) => (c.class = "Die")).results,
    target: rollTarget,
    roll: roll,
    resultRender: await roll.render(),
  };
}

/**
 *
 * @param {Object} actor
 * @param {string} chatTitle title for skillName, spellName, etc... This function doesn't localise it itself
 * @param {Roll} roll
 * @param {*} rollDialogue
 * @param {Number} rollTarget
 * @param {Object} extra object with extra information you may wish to include for specific types
 * @returns {ChatDataObject}
 */
export async function createChatData(actor, chatTitle, roll, rollDialogue, rollTarget, extra) {
  let chatData = {
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    rollTitle: chatTitle,
    isSuccess: roll.total <= rollTarget,
    // critical if all 3 dice results were the same
    // get only active die, the check that every active result's value is equal to the first one's
    isCritical: isCritical(roll),
    attributeKey: rollDialogue.attribute,
    config: CONFIG,
    extra: extra,
    roll: await rollToChatRollObject(roll, rollDialogue, rollTarget),
  };
  return chatData;
}

/**
 *
 * @param {ChatDataObject} rollData
 * @param {string} type The type of roll
 */
export async function rollToChat(rollData, type) {
  // get speaker info and append to rollData
  let speaker = rollData.speaker;
  // if it's a token, appender a tokenId
  if (speaker.token) {
    rollData.tokenId = speaker.token;
  }

  // create html
  // TODO the rollData should really just contain roll.render() result to shove into the html
  let html;
  if (type === "skill") {
    html = await renderTemplate(
      "systems/runescape-kingdoms/templates/chat/roll-skill.hbs",
      rollData
    );
  } else if (type === "spell") {
    html = await renderTemplate(
      "systems/runescape-kingdoms/templates/chat/roll-spell.hbs",
      rollData
    );
  } else if (type === "prayer") {
    html = await renderTemplate(
      "systems/runescape-kingdoms/templates/chat/roll-prayer.hbs",
      rollData
    );
  }

  let chatData = {
    user: game.user.id,
    speaker: speaker,
    rolls: rollData.roll.roll,
    content: html,
    sound: "sounds/dice.wav",
    type: type,
    flags: rollData.extra, //pass this as well
  };

  if (["gmroll", "blindroll"].includes(chatData.rollMode)) {
    chatData.whisper = ChatMessage.getWhisperRecipients("GM");
  } else if (chatData.rollMode === "selfroll") {
    chatData.whisper = [game.user];
  }

  await ChatMessage.create(chatData);
}

/**
 * Creates a basic roll dialogue with advantage and disadvantage
 * @param {string[]} attributes list of attributes you wish to be available
 * @param {*} title
 * @returns
 */
export async function createRollDialogueV2(attributes, title) {
  // https://foundryvtt.wiki/en/development/api/dialogv2
  //create the dialogue v2 html
  const rollData = {
    attributes: attributes,
    config: CONFIG,
  };
  const dialogueContent = await renderTemplate(
    "systems/runescape-kingdoms/templates/dialogs/rollDialogue-check.hbs",
    rollData
  );

  const rollDialogue = await foundry.applications.api.DialogV2.wait({
    window: { title: title },
    content: dialogueContent,
    modal: true,
    // This example does not use i18n strings for the button labels,
    // but they are automatically localized.
    buttons: [
      {
        label: game.i18n.localize("Rolls.Advantage"),
        action: "advantage",
        callback: (e, b, d) => {
          let obj = new FormDataExtended(b.form).object;
          obj.diceRoll = "4d6kl3";
          return obj;
        },
      },
      {
        label: game.i18n.localize("Rolls.Standard"),
        action: "standard",
        callback: (e, b, d) => {
          let obj = new FormDataExtended(b.form).object;
          obj.diceRoll = "3d6";
          return obj;
        },
      },
      {
        label: game.i18n.localize("Rolls.Disadvantage"),
        action: "disadvantage",
        callback: (e, b, d) => {
          let obj = new FormDataExtended(b.form).object;
          obj.diceRoll = "4d6kh3";
          return obj;
        },
      },
    ],
  });
  return rollDialogue;
}
