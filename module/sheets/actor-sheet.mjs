import { skillRollToChat } from "../helpers/chatFunctions.mjs";
import { onManageActiveEffect, prepareActiveEffectCategories } from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class RunescapeKingdomsActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["runescape-kingdoms", "sheet", "actor"],
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "skills",
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/runescape-kingdoms/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.document.toPlainObject();

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Adding a pointer to CONFIG.RUNESCAPE_KINGDOMS
    context.config = CONFIG.RUNESCAPE_KINGDOMS;

    // Prepare character data and items.
    if (actorData.type == "character") {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == "npc") {
      this._prepareItems(context);
    }

    // Enrich biography info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedBiography = await TextEditor.enrichHTML(this.actor.system.biography, {
      // Whether to show secret blocks in the finished html
      secrets: this.document.isOwner,
      // Necessary in v11, can be removed in v12
      async: true,
      // Data to fill in for inline rolls
      rollData: this.actor.getRollData(),
      // Relative UUID resolution
      relativeTo: this.actor,
    });

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    return context;
  }

  /**
   * Character-specific context modifications
   *
   * @param {object} context The context object to mutate
   */
  _prepareCharacterData(context) {
    // This is where you can enrich character-specific editor fields
    // or setup anything else that's specific to this type
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const backgrounds = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
    };

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      if (i.type === "item") {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === "feature") {
        features.push(i);
      }
      // Append to backgrounds
      else if (i.type === "background") {
        backgrounds.push(i);
      }
      // Append to spells.
      else if (i.type === "spell") {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.spells = spells;
    context.backgrounds = backgrounds;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on("click", ".item-edit", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.on("click", ".item-create", this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.on("click", ".item-delete", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.on("click", ".effect-control", (ev) => {
      const row = ev.currentTarget.closest("li");
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    // Rollable abilities/skills
    html.on("click", ".rollable-attribute", this._onRoll.bind(this));
    html.on("click", ".rollable-skill", this._onRollSkill.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find("li.item").each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  async _onRollSkill(event) {
    event.preventDefault();

    const dataset = event.currentTarget.dataset;

    //get the skill key
    const skillKey = dataset.skillKey;

    //label for the window
    let label = `${dataset.label ?? ""} ${game.i18n.localize(
      CONFIG.RUNESCAPE_KINGDOMS.ROLL_TYPES[dataset.rollType]
    )}`;

    //create the dialogue v2 html
    const skillCheckData = {
      actor: this.actor,
      config: CONFIG.RUNESCAPE_KINGDOMS,
    };
    const skillCheckContent = await renderTemplate(
      "systems/runescape-kingdoms/templates/dialogs/skill-check.hbs",
      skillCheckData
    );

    // TODO instead of using b.form.elements.NAME.value, use new FormDataExtended(button.form).object instead?
    // https://foundryvtt.wiki/en/development/api/dialogv2
    const rollDialogue = await foundry.applications.api.DialogV2.wait({
      window: { title: label },
      content: skillCheckContent,
      modal: true,
      // This example does not use i18n strings for the button labels,
      // but they are automatically localized.
      buttons: [
        {
          label: game.i18n.localize("Rolls.Advantage"),
          action: "advantage",
          callback: (e, b, d) => {
            return {
              attribute: b.form.elements.chosenAttributeSkillRoll.value,
              diceRoll: "4d6kl3",
              bonus: !isNaN(b.form.elements.bonusValue.value)
                ? Number(b.form.elements.bonusValue.value)
                : 0,
            };
          },
        },
        {
          label: game.i18n.localize("Rolls.Standard"),
          action: "standard",
          callback: (e, b, d) => {
            return {
              attribute: b.form.elements.chosenAttributeSkillRoll.value,
              diceRoll: "3d6",
              bonus: !isNaN(b.form.elements.bonusValue.value)
                ? Number(b.form.elements.bonusValue.value)
                : 0,
            };
          },
        },
        {
          label: game.i18n.localize("Rolls.Disadvantage"),
          action: "disadvantage",
          callback: (e, b, d) => {
            return {
              attribute: b.form.elements.chosenAttributeSkillRoll.value,
              diceRoll: "4d6kh3",
              bonus: !isNaN(b.form.elements.bonusValue.value)
                ? Number(b.form.elements.bonusValue.value)
                : 0,
            };
          },
        },
      ],
    });

    // get roll target (roll <= this to pass)
    const rollTarget =
      this.actor.system.skills[skillKey].value +
      this.actor.system.attributes[rollDialogue.attribute].value;

    // handle roll
    let roll = new Roll(`${rollDialogue.diceRoll} + @bonus`, {
      bonus: rollDialogue.bonus,
      target: rollTarget,
    });
    await roll.evaluate();

    let chatData = {
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      skillName: game.i18n.localize(CONFIG.RUNESCAPE_KINGDOMS.skills[skillKey]),
      isSuccess: roll.total <= rollTarget,
      // critical if all 3 dice results were the same
      // get only active die, the check that every active result's valeu is equal to the first one's
      isCritical: roll.terms
        .find((c) => (c.class = "Die"))
        .results.filter((c) => c.active)
        .every((c, i, a) => c.result == a?.[0]?.result),
      roll: {
        result: roll.total,
        bonus: rollDialogue.bonus,
        dice: roll.terms.find((c) => (c.class = "Die")).results,
        target: rollTarget,
        roll: roll,
      },
      attributeKey: rollDialogue.attribute,
      config: CONFIG.RUNESCAPE_KINGDOMS,
    };

    skillRollToChat(chatData);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == "item") {
        const itemId = element.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let typeLabel =
        dataset.rollType === "attribute"
          ? ` ${game.i18n.localize(CONFIG.RUNESCAPE_KINGDOMS.ROLL_TYPES[dataset.rollType])}`
          : "";
      let label = dataset.label ? `${dataset.label}` : "";
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label + typeLabel,
        rollMode: game.settings.get("core", "rollMode"),
      });
      return roll;
    }
  }
}
