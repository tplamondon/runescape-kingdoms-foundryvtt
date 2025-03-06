export async function skillRollToChat(rollData) {
  //TODO remove debug printing of passed value
  console.debug(rollData);

  let speaker = ChatMessage.getSpeaker();

  let chatData = {
    user: game.user.id,
    rollMode: game.settings.get("core", "rollMode"),
    speaker: speaker,
  };

  //   if it's a token
  if (speaker.token) {
    rollData.tokenId = speaker.token;
  }

  let html = await renderTemplate(
    "systems/runescape-kingdoms/templates/chat/roll-skill.hbs",
    rollData
  );

  chatData.content = html;

  if (["gmroll", "blindroll"].includes(chatData.rollMode)) {
    chatData.whisper = ChatMessage.getWhisperRecipients("GM");
  } else if (chatData.rollMode === "selfroll") {
    chatData.whisper = [game.user];
  }
  ChatMessage.create(chatData);
}
