/**
 *
 * @param {Object} rollData
 * @param {Object} rollData.speaker the speaker
 * @param {string} rollData.skillName the localised name of the skill
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
export async function skillRollToChat(rollData) {
  let speaker = rollData.speaker;

  // if it's a token, appender a tokenId
  if (speaker.token) {
    rollData.tokenId = speaker.token;
  }

  //create HTML
  let html = await renderTemplate(
    "systems/runescape-kingdoms/templates/chat/roll-skill.hbs",
    rollData
  );

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
