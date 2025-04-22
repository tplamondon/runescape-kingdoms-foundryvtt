export default async function addListeners(msg, html) {
  if (msg.type === "prayer") {
    await addListenersPrayer(msg, html);
  }
}

async function addListenersPrayer(msg, html) {
  const flags = msg.flags;
  html.find(".prayer-turns").on("click", async (event) => {
    event.preventDefault();
    // set display roll to true
    await msg.update({ "system.displayRoll": true });
    await msg.alterMessageHTML(html);
    await msg.render();
  });
}
