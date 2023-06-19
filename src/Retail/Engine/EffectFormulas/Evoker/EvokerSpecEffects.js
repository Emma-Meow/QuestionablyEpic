

export const getEvokerSpecEffect = (effectName, player, contentType) => {
  // These are going to be moved to a proper file soon.


  let bonus_stats = {};
  if (effectName === "Evoker T30-2") {
    // Placeholder pulled from sheet. Replace very soon.
    bonus_stats.hps = 8750;

  }
  else if (effectName === "Evoker T30-4") {
    // Placeholder pulled from sheet. Replace very soon.
    bonus_stats.hps = 6500;

  }
  else if (effectName === "Evoker T29-2") {
    // This needs a much more comprehensive formula.
    const reversionPercent = contentType === "Raid" ? 0.1 : 0.15;
    const critIncrease = 25;
    const uptime = 0.55;
    bonus_stats.crit = reversionPercent * critIncrease * 170 * uptime;


  }
  else if (effectName === "Evoker T29-4") {
    // The Evoker 4pc increases our Living Flame damage by 20% per stack, and also makes it instant.
    // It procs frequently and we can rely on it being active for most of our Living Flame casts.
    // The damage advantage is obvious, but the healing is a little more difficult.

    // Number of Essence Burst procs per minute.
    // Some of these would just be regular Living Flame casts. These could be excluded.
    const livingFlameCPM = 3.5;
    const essenceBurstsPerMinute = livingFlameCPM * 0.2;

    const reversionTicks = 6 * 1.3 / (1 - (player.getStatPerc("crit") - 1))
    const oneReversion = 0.342 * reversionTicks * player.getStatMults(["intellect", "haste", "versatility", "crit", "mastery"]); // The extra healing from 2 additional WG targets a minute.
    const oneEcho = 1 * player.getStatMults(["intellect", "haste", "versatility", "crit", "mastery"])

    const essenceBurstHealing = oneEcho + oneReversion;
    bonus_stats.hps = essenceBurstHealing * essenceBurstsPerMinute / 60;

  }

  else {
    bonus_stats.hps = 0;
    bonus_stats.dps = 0;
  }

  return bonus_stats;
};
