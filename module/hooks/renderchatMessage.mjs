import { RunescapeKingdomsMessage } from "../documents/chat-message.mjs";

/**
 *
 * @param {RunescapeKingdomsMessage} message The ChatMessage document being rendered
 * @param {HTMLLIElement} html The pending HTML
 * @param {*} messageData
 */
export async function renderChatMessage(message, html, messageData) {
  if (message.alterMessageHTML instanceof Function) {
    await message.alterMessageHTML(html);
  }
  if (message.system.addListeners instanceof Function) {
    await message.addListeners(html);
  }

  await message.render();
}
