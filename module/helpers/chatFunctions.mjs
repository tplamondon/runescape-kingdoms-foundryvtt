import { RUNESCAPE_KINGDOMS as CONFIG } from "./config.mjs";
import { isCritical } from "./rollHelpers.mjs";

/**
 *
 * @param {Object} roll roll object
 * @param {Object} rollDialogue dialoguev2 from roll
 * @param {Number} rollTarget the target
 * @returns
 */
export function rollToChatRollObject(roll, rollDialogue, rollTarget) {
  return {
    result: roll.total,
    bonus: rollDialogue.bonus,
    dice: roll.terms.find((c) => (c.class = "Die")).results,
    target: rollTarget,
    roll: roll,
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
 * @returns
 */
export function createChatData(actor, chatTitle, roll, rollDialogue, rollTarget, extra) {
  let chatData = {
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    rollTitle: chatTitle,
    isSuccess: roll.total <= rollTarget,
    // critical if all 3 dice results were the same
    // get only active die, the check that every active result's value is equal to the first one's
    isCritical: isCritical(roll),
    roll: rollToChatRollObject(roll, rollDialogue, rollTarget),
    attributeKey: rollDialogue.attribute,
    config: CONFIG,
    extra: extra,
  };
  return chatData;
}

//--------------------------------------------------------------------------------------//
//                                   Async Functions                                    //
//--------------------------------------------------------------------------------------//

/**
 *
 * @param {Object} rollData
 * @param {Object} rollData.speaker the speaker
 * @param {string} rollData.chatTitle the localised name for the chat title
 * @param {boolean} rollData.isSuccess if roll was a success
 * @param {string} rollData.attributeKey the attribute key. RUNESCAPE_KINGDOMS.attributes in config.mjs
 * @param {Object} rollData.config CONFIG.RUNESCAPE_KINGDOMS (easier to get from outside the function)
 * @param {Object} rollData.roll
 * @param {number} rollData.roll.result the total result
 * @param {number} rollData.roll.bonus the bonus/modifier to the dice roll
 * @param {number} rollData.roll.dice the die array
 * @param {number} rollData.roll.target the target to get <=
 * @param {Object} rollData.roll.roll the roll object
 */
export async function rollToChat(rollData, type) {
  // get speaker info and append to rollData
  let speaker = rollData.speaker;
  // if it's a token, appender a tokenId
  if (speaker.token) {
    rollData.tokenId = speaker.token;
  }

  // create html
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
  }

  let chatData = {
    user: game.user.id,
    speaker: speaker,
    rolls: rollData.roll.roll,
    content: html,
    sound: "sounds/dice.wav",
  };

  if (["gmroll", "blindroll"].includes(chatData.rollMode)) {
    chatData.whisper = ChatMessage.getWhisperRecipients("GM");
  } else if (chatData.rollMode === "selfroll") {
    chatData.whisper = [game.user];
  }
  ChatMessage.create(chatData);
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
