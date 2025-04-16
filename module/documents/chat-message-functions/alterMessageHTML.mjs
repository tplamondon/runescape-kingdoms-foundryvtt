export default async function alterMessageHTML(msg, html) {
  if (msg.type === "prayer") {
    await alterMessagePrayerHTML(msg, html);
  }
}

async function alterMessagePrayerHTML(msg, html) {
  const flags = msg.flags;
  if (msg.system.displayRoll) {
    const container = html.find(".prayer-turns-container");
    container[0].innerHTML = flags.turnRollHTML;
  }
}
