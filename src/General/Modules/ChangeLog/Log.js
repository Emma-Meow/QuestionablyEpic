/* -------------------------------------------------------------------------- */
/*                               Changelog Data                               */
/* -------------------------------------------------------------------------- */

/* ------- The latest update needs to be the first object in the array ------ */

// Template for Changelog Entry
// {version: "", update: , date: "", changes: ["",""]}

export const changeLog = [
  {
    version: "9.1 / 2.5.1",
    update: 6,
    date: "6th July",
    changes: [
      "Tome of Insight / First Class Healing Distributor were nerfed in game, and this is live in all modules.",
      "Bugfix: The Tazavesh int proc necks will now import at the correct item level."
    ],
  },
  {
    version: "9.1 / 2.5.1",
    update: 5,
    date: "5th July",
    changes: [
      "Launched the 9.1 Upgrade Finder.",
      "Added a back button to the Retail upgrade Finder. BC already had it.",
      "Bugfix: Crafted items should no longer import with more stats than they should.",
    ],
  },
  {
    version: "9.1 / 2.5.1",
    update: 4,
    date: "4th July",
    changes: [
      "Added Spiritual Alchemy Stone to the trinket chart.",
      "Added formula for Perfectly Forged Credentials and variants.",
      "Added SimC Import support for 230 crafted items.",
    ],
  },
  {
    version: "9.1 / 2.5.1",
    update: 3,
    date: "1st July",
    changes: [
      "Updated Trinket Analysis Colors.",
      "Updated formulas for Anima Sphere, Hallowed Discernment and Well-Honed Instincts to match live values.",
      "Adjusted stat soft DR coefficients for the new patch.",
    ],
  },
  {
    version: "9.1 / 2.5.1",
    update: 2,
    date: "30th June",
    changes: [
      "Soulbinds: Combat Med, Soothing Shade, Grove Invigoration and Bron all updated to the now nerfed in-game values.",
      "Disc Priest: Updated the default spell model for 9.1.",
      "New Trinket: Tome of Insight.",
      "Bugfix: Covenant icons should now appear as expected."
    ],
  },
  {
    version: "9.1 / 2.5.1",
    update: 1,
    date: "29th June",
    changes: [
      "Retail: All 9.1 content added to the game.",
    ],
  },
  {
    version: "9.0.5 / 2.5.1",
    update: 9,
    date: "22nd June",
    changes: [
      "Bugfix: BC Troll Priests should no longer get an error when running Top Gear or Upgrade Finder.",
      "Bugfix: Importing Suffixed items multiple times should no longer double their stat allocations.",
      "Bugfix: Fixed a rare bug where some BC gems weren't using the correct stat line."
    ],
  },
  {
    version: "9.0.5 / 2.5.1",
    update: 8,
    date: "10th June",
    changes: [
      "Improved clarity around the QE Import addon, and where to get it.",
      "Revamped the help text at the top of every module.",
      "BC: Added Badge gear to Upgrade Finder."
    ],
  },
  {
    version: "9.0.5 / 2.5.1",
    update: 7,
    date: "8th June",
    changes: [
      "Fixed a bug where gems were being counted twice in set scores.",
      "Fixed a bug where Spirit was being undervalued for BC Druid.",
      "Fixed some minor UI bugs."
    ],
  },
  {
    version: "9.0.5 / 2.5.1",
    update: 6,
    date: "2nd June",
    changes: [
      "Added support for gear with Suffixes (like of the Owl, of the Whale and so on).",
      "Added formulas for all levelling trinkets.",
      "Added a Top Gear setting to use the Honor Hold starter gems since blues / epics aren't really appropriate for levelling gear."
    ],
  },
  {
    version: "9.0.5 / 2.5.1",
    update: 5,
    date: "1st June",
    changes: [
      "Added full support for all four Burning Crusade Classic specs.",
      "BC: Added Tier Sets module.",
      "Added Welcome screen for players new to the app.",
      "Retail / BC: All items now have attached tooltips."
    ],
  },
  {
    version: "9.0.5",
    update: 4,
    date: "29th April",
    changes: [
      "New 'auto-socket' setting in Top Gear / Upgrade Finder to automatically add sockets to compatible slots.",
      "Added the Hall of Fame. Thank you so much to all patrons.",
      "Added Darkmoon Deck: Repose to the trinket graph as requested.",
      "Significant visual revamps through the app!",
      "Sweeping code cleanup and revamps behind the scenes to prepare for both Burning Crusade and 9.1.",
    ],
  },
  {
    version: "9.0.5",
    update: 3,
    date: "23th March",
    changes: [
      "Added the Trinket Analysis module",
      "Added another large set of Russian translations",
      "Default class trinket models updated slightly. You should see only slight shifts.",
    ],
  },
  {
    version: "9.0.5",
    update: 2,
    date: "11th March",
    changes: [
      "Addded a beta version of the Russian language.",
      "Upgrade Finder Visual Update",
      "Quick Compare Visual Update",
      "Slightly adjusted Paladin default weights in response to the mana cost change.",
    ],
  },
  {
    version: "9.0.5",
    update: 1,
    date: "9th March",
    changes: [
      "9.05 fully implemented.",
      "9.0.5: Legendary changes to Paladin, Druid, Shaman.",
      "Upgrade Finder: Added all Valor ilvls for dungeon gear.",
      "Updated the default spell data for all specs.",
      "9.0.5: Trinkets with flat healing have been buffed by roughly 11%.",
      "9.0.5: Almost every piece of gear has shifted by 1-2 secondary and primary stats.",
    ],
  },
  {
    version: "9.0.2",
    update: 25,
    date: "3rd March",
    changes: [
      "Upgrade Finder 'Slots' - A New Tab to show you upgrades sorted by slot rather than drop location.",
      "Upgrade Finder: The Settings tab has been copied across from Top Gear.",
      "Various visual improvements across the app. (SimC import bar, Settings Bar, Language Selection, Menus, Icons & more).",
      "SimC strings for classes that differ to the one you have selected will now be rejected to avoid confusion",
      "Bugfix: Fixed a bug where sets with excess Leech would overly devalue the stat in Top Gear."
    ],
  },
  {
    version: "9.0.2",
    update: 24,
    date: "23rd February",
    changes: [
      "New: Added Recent articles and spec guides to the main menu.",
      "New: Top Gear now has a settings panel for advanced configuration.",
      "New: Added Burning Crusade Timewalking gear.",
      "Top Gear: Items that differ from what you have equipped will highlight in yellow.",
      "Top Gear: Revamped Competitive Alternatives & increased closest sets to 8 (was 4).",
      "Top Gear: Re-implemented diminishing returns formulas.",
      "Revamped character edit pane.",
      "Druid: Dark Titans Lesson now includes Photosynthesis value in dungeons.",
      "Heavy visual improvements through the app.",
    ],
  },
  {
    version: "9.0.2",
    update: 23,
    date: "11th February",
    changes: [
      "New: Changelog to improve transparency",
      "Large codebase revamp to prepare for the rest of the expansion.",
      "Updated: The Summary Panel in #Covenants should now be clearer to read.",
      "Venthyr Paladin Covenant Ability score now correctly displays HPS.",
      "Monk: Necrolord conduit 'Bone Marrow Hops' now correctly uses the 50% hit chance of Bonedust Brew",
      "General Draven's 'Hold Your Ground' has been updated to better reflect real world uptimes. The current Disc Priest bug is also included.",
    ],
  },
];