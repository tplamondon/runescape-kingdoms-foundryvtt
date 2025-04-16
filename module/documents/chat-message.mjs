import addListeners from "./chat-message-functions/addListeners.mjs";
import alterMessageHTML from "./chat-message-functions/alterMessageHTML.mjs";

export class RunescapeKingdomsMessage extends ChatMessage {
  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
  }

  async alterMessageHTML(html) {
    await addListeners(this, html);
  }
  async addListeners(html) {
    await alterMessageHTML(this, html);
  }
}
