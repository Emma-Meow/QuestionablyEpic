// 
import { applyDiminishingReturns } from "General/Engine/ItemUtilities";



const GLOBALCONST = {
    rollRNG: true, // Model RNG through chance. Increases the number of iterations required for accuracy but more accurate than other solutions.
    statPoints: {
        crit: 180,
        mastery: 180,
        vers: 205,
        haste: 170,
        leech: 110,
    }

}

export const addBuff = (state, spell, spellName) => {
    if (spell.buffType === "stats") {
        addReport(state, "Adding Buff: " + spellName + " for " + spell.buffDuration + " seconds (" + spell.value + " " + spell.stat + ")");
        state.activeBuffs.push({name: spellName, expiration: state.t + spell.buffDuration, buffType: "stats", value: spell.value, stat: spell.stat});
    }
    else if (spell.buffType === "statsMult") {
        addReport(state, "Adding Buff: " + spellName + " for " + spell.buffDuration + " seconds (" + spell.value + " " + spell.stat + " - Mult)");
        state.activeBuffs.push({name: spellName, expiration: state.t + spell.buffDuration, buffType: "statsMult", value: spell.value, stat: spell.stat});
    }
    else if (spell.buffType === "damage" || spell.buffType === "heal") {     
        const newBuff = {name: spellName, buffType: spell.buffType, attSpell: spell,
            tickRate: spell.tickRate, canPartialTick: spell.canPartialTick, next: state.t + (spell.tickRate / getHaste(state.currentStats))}

        newBuff['expiration'] = spell.hastedDuration ? state.t + (spell.buffDuration / getHaste(state.currentStats)) : state.t + spell.buffDuration
        state.activeBuffs.push(newBuff)

    }
    else if (spell.buffType === "special") {
        addReport(state, "Adding Buff: " + spellName + " for " + spell.buffDuration + " seconds.");
        // Check if buff already exists, if it does add a stack.
        const buffStacks = state.activeBuffs.filter(function (buff) {return buff.name === spell.name}).length;
        if (buffStacks === 0) state.activeBuffs.push({name: spell.name, expiration: (state.t + spell.castTime + spell.buffDuration) || 999, buffType: "special", value: spell.value, stacks: spell.stacks || 1, canStack: spell.canStack});
        else {
            const buff = state.activeBuffs.filter(buff => buff.name === spell.name)[0]
            
            if (buff.canStack) buff.stacks += 1;
        }
    }
    else if (spell.buffType === "function") {
        const newBuff = {name: spell.name, buffType: spell.buffType, attSpell: spell,
            tickRate: spell.tickRate / getHaste(state.currentStats), canPartialTick: spell.canPartialTick || false, 
            next: state.t + (spell.tickRate / getHaste(state.currentStats))}
        newBuff.attFunction = spell.function;
        newBuff.expiration = spell.hastedDuration ? state.t + (spell.buffDuration / getHaste(state.currentStats)) : state.t + spell.buffDuration
        
        state.activeBuffs.push(newBuff);

    }     
    else {
        state.activeBuffs.push({name: spellName, expiration: state.t + spell.castTime + spell.buffDuration});
    }
    
}

export const removeBuff = (buffs, buffName) => {
    return buffs.filter((buff) => buff.name !== buffName);
}

// Removes a stack of a buff, and removes the buff entirely if it's down to 0 or doesn't have a stack mechanic.
export const removeBuffStack = (buffs, buffName) => {
    const buff = buffs.filter(buff => buff.name === buffName)[0]
    
    if (buff === undefined) return buffs;
    const buffStacks = buff.stacks || 0;

    if (buffStacks === 1) {
        // Remove the buff
        buffs = removeBuff(buffs, buffName);
    }
    else if (buffStacks >= 1) {
        // The player has more than 1 stack of the buff. Remove one and leave the buff.
        const activeBuff = buffs.filter(buff => buff.name === buffName)[0];
        activeBuff.stacks = activeBuff.stacks - 1;
    }
    else {
        // The player doesn't have the buff at all.
        // This is not necessarily an error.
    }
    return buffs;
}


/** Check if a specific buff is active. Buffs are removed when they expire so this is active buffs only.
 * @param buffs An array of buff objects.
 * @param buffName The name of the buff we're searching for.
 */
export const checkBuffActive = (buffs, buffName) => {
    return buffs.filter(function (buff) {return buff.name === buffName}).length > 0;
}

/** Check if a specific buff is active and returns how many stacks of it we have.
 * @param buffs An array of buff objects.
 * @param buffName The name of the buff we're searching for.
 */
 export const getBuffStacks = (buffs, buffName) => {
    const buff = buffs.filter(function (buff) {return buff.name === buffName})[0]
    return buff.stacks || 0;
}

/**  Extend any buffs named @spellName by @extension seconds. */
export const extendBuff = (activeBuffs, timer, spellName, extension) => {
    activeBuffs.forEach((buff) => {
        if (buff.name === spellName) {
            buff.expiration += extension;
        }
    });
}


/**
 * Returns a spells stat multiplier based on which stats it scales with.
 * Haste is included in calculations but isn't usually a raw multiplier since it changes cooldown instead. 
 * @param {*} statArray A characters current stats including any active buffs.
 * @param {*} stats The secondary stats a spell scales with. Pulled from it's SpellDB entry.
 * @returns An effective multiplier. For a spell that scales with both crit and vers this would just be crit x vers.
 */
export const getStatMult = (currentStats, stats, statMods, specConstants) => {
    let mult = 1;
    const baseMastery = specConstants.masteryMod / 100 * 8; // Every spec owns 8 mastery points baseline

    const critChance = 0.05 + currentStats['crit'] / GLOBALCONST.statPoints.crit / 100 + (statMods['crit'] || 0 );
    if (stats.includes("vers")) mult *= (1 + currentStats['versatility'] / GLOBALCONST.statPoints.vers / 100);
    if (stats.includes("haste")) mult *= (1 + currentStats['haste'] / GLOBALCONST.statPoints.haste / 100);
    if (stats.includes("crit")) mult *= ((1-critChance) + critChance * (currentStats['critMult'] || 2));
    if (stats.includes("mastery")) mult *= (1+(baseMastery + currentStats['mastery'] / GLOBALCONST.statPoints.mastery * specConstants.masteryMod / 100) * specConstants.masteryEfficiency);
    return mult;
}

/**
 * Get our players active stats. This is made up of our base stats + any buffs. 
 * Diminishing returns is not in play in this function.
 * @param {} statArray Our active stats.
 * @param {*} buffs Our active buffs.
 * @returns 
 */
export const getCurrentStats = (statArray, buffs) => {
    const statBuffs = buffs.filter(function (buff) {return buff.buffType === "stats"});
    statBuffs.forEach(buff => {
        statArray[buff.stat] = (statArray[buff.stat] || 0) + buff.value;
    });

    //statArray = applyDiminishingReturns(statArray); // TODO: Update Diminishing Returns

    // Check for percentage stat increases which are applied post-DR.
    // Examples include Power Infusion and the crit portion of Shadow Word: Manipulation.
    const multBuffs = buffs.filter(function (buff) {return buff.buffType === "statsMult"});
    multBuffs.forEach(buff => {
        // Multiplicative Haste buffs need some extra code as they are increased by the amount of haste you already have.
        if (buff.stat === "haste") statArray["haste"] = (((statArray[buff.stat] / 170 / 100 + 1) * buff.value)-1) * 170 * 100;
        else statArray[buff.stat] = (statArray[buff.stat] || 0) + buff.value;
    });

    return statArray;
}

// Returns the players current haste percentage. 
export const getHaste = (stats) => {
    return 1 + stats.haste / 170 / 100;
}

export const getCrit = (stats) => {
    return 1 + stats.crit / 180 / 100;
}

export const addReport = (state, entry) => {
    if (state.settings.reporting) {
        state.report.push(Math.round(100*state.t)/100 + " " + entry);
    }
}

export const getHealth = (stats, talents) => {
    return stats.stamina * 20 * (1 + talents.draconicLegacy * 0.02);
}

const getSqrt = (targets) => {
    return Math.sqrt(targets);
}

const getSpellFlat = (spell, flatBonus = 0) => {
    return ((spell.flatHeal) || 0 + (spell.flatDamage || 0) + flatBonus)
}

/**
 * Get a spells raw damage or healing. This is made up of it's coefficient, our intellect, and any secondary stats it scales with.
 * We'll take care of multipliers like Schism and Sins in another function.
 * @param {object} spell The spell being cast. Spell data is pulled from DiscSpellDB. 
 * @param {object} currentStats A players current stats, including any buffs.
 * @returns The raw damage or healing of the spell.
 */
export const getSpellRaw = (spell, currentStats, specConstants, flatBonus = 0) => {
    return (getSpellFlat(spell, flatBonus) + spell.coeff * currentStats.intellect) * getStatMult(currentStats, spell.secondaries, spell.statMods || {}, specConstants); // Multiply our spell coefficient by int and secondaries.
}


// This is a boilerplate function that'll let us clone our spell database to avoid making permanent changes.
// We need this to ensure we're always running a clean DB, free from any changes made on previous runs.
const deepCopyFunction = (inObject) => {
    let outObject, value, key;
  
    if (typeof inObject !== "object" || inObject === null) {
      return inObject; // Return the value if inObject is not an object
    }
  
    // Create an array or object to hold the values
    outObject = Array.isArray(inObject) ? [] : {};
  
    for (key in inObject) {
      value = inObject[key];
  
      // Recursively (deep) copy for nested objects, including arrays
      outObject[key] = deepCopyFunction(value);
    }
  
    return outObject;
  };

