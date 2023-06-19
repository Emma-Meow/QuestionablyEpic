// 
import { applyDiminishingReturns } from "General/Engine/ItemUtilities";
import { DRUIDSPELLDB } from "./RestoDruidSpellDB";
import { reportError } from "General/SystemTools/ErrorLogging/ErrorReporting";
import { addReport, checkBuffActive, removeBuffStack, getCurrentStats, getHaste, getSpellRaw, getStatMult, GLOBALCONST, removeBuff, getBuffStacks, getHealth, extendBuff, addBuff } from "Retail/Engine/EffectFormulas/Generic/RampBase";

// Any settings included in this object are immutable during any given runtime. Think of them as hard-locked settings.
const discSettings = {
    chaosBrand: true
}

const DRUIDCONSTANTS = {
    masteryMod: 1.5,
    masteryEfficiency: 0.8,
    wingsBuff: 0.2, // Wings is a 20% buff to damage, healing and crit chance.
    baseMana: 10000,
    beaconOverhealing: 0.4,
    auraHealingBuff: 1.06, // Buffs all healing
    auraDamageBuff: 0.92, 
}

/**
 * This function handles all of our effects that might change our spell database before the ramps begin.
 * It includes conduits, legendaries, and some trinket effects.
 * 
 * @param {*} palaSpells Our spell database
 * @param {*} settings Settings including legendaries, trinkets, soulbinds and anything that falls out of any other category.
 * @param {*} talents The talents run in the current set.
 * @returns An updated spell database with any of the above changes made.
 */
 const applyLoadoutEffects = (palaSpells, settings, talents, state) => {

    // ==== Default Loadout ====
    // While Top Gear can automatically include everything at once, individual modules like Trinket Analysis require a baseline loadout
    // since if we compare trinkets like Bell against an empty loadout it would be very undervalued. This gives a fair appraisal when
    // we don't have full information about a character.
    // As always, Top Gear is able to provide a more complete picture. 
    if (settings['DefaultLoadout']) {
        if (settings.playstyle === "Kyrian Evangelism") {

        }
        else if (settings.playstyle === "Venthyr Evangelism") {

        }
    }

    // ==== Talents ====
    // Not all talents just make base modifications to spells, but those that do can be handled here.

    // Paladin class talents.


    // Paladin spec talents.
    // Remember, if it adds an entire ability then it shouldn't be in this section. Add it to ramp generators in DiscRampGen.


    // ==== Legendaries ====

    return palaSpells;
}


/** A spells damage multiplier. It's base damage is directly multiplied by anything the function returns.
 * @schism 25% damage buff to primary target if Schism debuff is active.
 * @sins A 3-12% damage buff depending on number of active atonements.
 * @chaosbrand A 5% damage buff if we have Chaos Brand enabled in Disc Settings.
 * @AscendedEruption A special buff for the Ascended Eruption spell only. The multiplier is equal to 3% (4 with conduit) x the number of Boon stacks accrued.
 */
const getDamMult = (state, buffs, activeAtones, t, spellName, talents) => {
    let mult = DRUIDCONSTANTS.auraDamageBuff;
    
    mult *= (buffs.filter(function (buff) {return buff.name === "Avenging Wrath"}).length > 0 ? 1.2 : 1); 
    
    if (discSettings.chaosBrand) mult = mult * 1.05; // TODO: Split into Phys / Magic

    return mult; 
}

/** A healing spells healing multiplier. It's base healing is directly multiplied by whatever the function returns.
 * @powerwordshield Gets a 200% buff if Rapture is active (modified by Exaltation if taken)
 * @ascendedEruption The healing portion also gets a buff based on number of boon stacks on expiry.
 */
const getHealingMult = (buffs, t, spellName, talents) => {
    let mult = DRUIDCONSTANTS.auraHealingBuff;
    
    mult *= (buffs.filter(function (buff) {return buff.name === "Avenging Wrath"}).length > 0 ? 1.2 : 1); 
    
    return mult;
}


// Current atonement transfer rate.
// Diminishing returns are taken care of in the getCurrentStats function and so the number passed 
// to this function can be considered post-DR.
const getAtoneTrans = (mastery) => {
    const atonementBaseTransfer = 0.5;
    return atonementBaseTransfer * (1.108 + mastery / 25.9259 / 100);
}

const getSqrt = (targets) => {
    return Math.sqrt(targets);
}



// This function is for time reporting. It just rounds the number to something easier to read. It's not a factor in any results.
const getTime = (t) => {
    return Math.round(t*1000)/1000
}

export const runHeal = (state, spell, spellName, compile = true) => {

    // Pre-heal processing
    const currentStats = state.currentStats;
    let beaconHealing = 0;
    const healingMult = getHealingMult(state.activeBuffs, state.t, spellName, state.talents); 
    const targetMult = ('tags' in spell && spell.tags.includes('sqrt')) ? getSqrt(spell.targets) : spell.targets;
    const healingVal = getSpellRaw(spell, currentStats) * (1 - spell.expectedOverheal) * healingMult * targetMult;
    
    
    
    if (compile) state.healingDone[spellName] = (state.healingDone[spellName] || 0) + healingVal;


    return healingVal;
}

export const runDamage = (state, spell, spellName, atonementApp, compile = true) => {

    const activeAtonements = getActiveAtone(atonementApp, state.t); // Get number of active atonements.
    const damMultiplier = getDamMult(state, state.activeBuffs, activeAtonements, state.t, spellName, state.talents); // Get our damage multiplier (Schism, Sins etc);
    const damageVal = getSpellRaw(spell, state.currentStats) * damMultiplier;
    
    // This is stat tracking, the atonement healing will be returned as part of our result.
    if (compile) state.damageDone[spellName] = (state.damageDone[spellName] || 0) + damageVal; // This is just for stat tracking.

    return damageVal;
    //if (state.reporting) console.log(getTime(state.t) + " " + spellName + ": " + damageVal + ". Buffs: " + JSON.stringify(state.activeBuffs) + " to " + activeAtonements);
}

const canCastSpell = (state, spellDB, spellName) => {
    
    const spell = spellDB[spellName][0];
    let miscReq = true;
    const holyPowReq = (spell.holyPower + state.holyPower > 0 ) || !spell.holyPower;
    const cooldownReq = (state.t > spell.activeCooldown) || !spell.cooldown;
    if (spellName === "Hammer of Wrath") {
        if (!checkBuffActive(state.activeBuffs, "Avenging Wrath")) miscReq = false;
    } 
    //console.log("Checking if can cast: " + spellName + ": " + holyPowReq + cooldownReq)
    return cooldownReq && holyPowReq && miscReq;
}

const getSpellHPM = (state, spellDB, spellName) => {
    
    const spell = spellDB[spellName][0];
    const spellHealing = runHeal(state, spell, spellName, false)

    return spellHealing / spell.cost || 0;

}



export const genSpell = (state, spells) => {
    let spellName = ""

    const usableSpells = [...apl].filter(spell => canCastSpell(state, spells, spell));

    /*
    if (state.holyPower >= 3) {
        spellName = "Light of Dawn";
    }
    else {
        let possibleCasts = [{name: "Holy Shock", score: 0}, {name: "Flash of Light", score: 0}]

        possibleCasts.forEach(spellData => {
            if (canCastSpell(state, spells, spellData['name'])) {
                spellData.score = getSpellHPM(state, spells, spellData['name'])
            }
            else {
                spellData.score = -1;
            }
        });
        possibleCasts.sort((a, b) => (a.score < b.score ? 1 : -1));
        console.log(possibleCasts);
        spellName = possibleCasts[0].name;
    }
    console.log("Gen: " + spellName + "|");
    */
    return usableSpells[0];

}

// Returns the value of one holy power.
// This can be used for the following:
// - To work out whether a spells Holy Power value is enough to make it worth the cast.
// - To add on the value of stuff like Divine Purpose where we don't want to roll a dice, but instead add on the value of the free cast.

// This function should include:
// - The healing value from our best spender (divided by 3). 
// - Any extra value we get from casting a spender, like SL Awakening.
const getOneHolyPower = (state) => {

}

const runSpell = (state, spell) => {

}

const apl = ["Avenging Wrath", "Light of Dawn", "Holy Shock", "Hammer of Wrath", "Crusader Strike", "Judgment", "Rest"]


/**
 * Run a full cast sequence. This is where most of the work happens. It runs through a short ramp cycle in order to compare the impact of different trinkets, soulbinds, stat loadouts,
 * talent configurations and more. Any effects missing can be easily included where necessary or desired.
 * @param {} sequence A sequence of spells representing a ramp. Note that in two ramp cycles like alternating Fiend / Boon this function will cover one of the two (and can be run a second
 * time for the other).
 * @param {*} stats A players base stats that are found on their gear. This doesn't include any effects which we'll apply in this function.
 * @param {*} settings Any special settings. We can include soulbinds, legendaries and more here. Trinkets should be included in the cast sequence itself and conduits are handled below.
 * @param {object} conduits Any conduits we want to include. The conduits object is made up of {ConduitName: ConduitLevel} pairs where the conduit level is an item level rather than a rank.
 * @returns The expected healing of the full ramp.
 */
 export const runCastSequence = (sequence, stats, settings = {}, incTalents = {}) => {
    //console.log("Running cast sequence");
    const talents = {};
    for (const [key, value] of Object.entries(incTalents)) {
        talents[key] = value.points;
    }

    let state = {t: 0, report: [], activeBuffs: [], healingDone: {}, damageDone: {}, manaSpent: 0, settings: settings, talents: talents, reporting: true}



    let atonementApp = []; // We'll hold our atonement timers in here. We keep them seperate from buffs for speed purposes.
    let nextSpell = 0;

    // Note that any talents that permanently modify spells will be done so in this loadoutEffects function. 
    // Ideally we'll cover as much as we can in here.
    const discSpells = applyLoadoutEffects(deepCopyFunction(DRUIDSPELLDB), settings, talents, state, stats);

    const seq = [...sequence];
    const sequenceLength = 45; // The length of any given sequence. Note that each ramp is calculated separately and then summed so this only has to cover a single ramp.

    for (var t = 0; state.t < sequenceLength; state.t += 0.01) {

        // Check for any expired atonements. 
        atonementApp = atonementApp.filter(function (buff) {return buff > state.t});
        
        // ---- Heal over time and Damage over time effects ----
        // When we add buffs, we'll also attach a spell to them. The spell should have coefficient information, secondary scaling and so on. 
        // When it's time for a HoT or DoT to tick (state.t > buff.nextTick) we'll run the attached spell.
        // Note that while we refer to DoTs and HoTs, this can be used to map any spell that's effect happens over a period of time. 
        // This includes stuff like Shadow Fiend which effectively *acts* like a DoT even though it is technically not one.
        // You can also call a function from the buff if you'd like to do something particularly special. You can define the function in the specs SpellDB.
        const healBuffs = state.activeBuffs.filter(function (buff) {return (buff.buffType === "heal" || buff.buffType === "damage" || buff.buffType === "function") && state.t >= buff.next})
        if (healBuffs.length > 0) {
            healBuffs.forEach((buff) => {
                let currentStats = {...stats};
                state.currentStats = getCurrentStats(currentStats, state.activeBuffs)

                if (buff.buffType === "heal") {
                    const spell = buff.attSpell;
                    runHeal(state, spell, buff.name + " (hot)")
                }
                else if (buff.buffType === "damage") {
                    const spell = buff.attSpell;
                    runDamage(state, spell, buff.name + " (dot)", atonementApp)
                }
                else if (buff.buffType === "function") {
                    const func = buff.attFunction;
                    func(state);
                } 
                buff.next = buff.next + (buff.tickRate / getHaste(state.currentStats));
            });  
        }

        // -- Partial Ticks --
        // When DoTs / HoTs expire, they usually have a partial tick. The size of this depends on how close you are to your next full tick.
        // If your Shadow Word: Pain ticks every 1.5 seconds and it expires 0.75s away from it's next tick then you will get a partial tick at 50% of the size of a full tick.
        // Note that some effects do not partially tick (like Fiend), so we'll use the canPartialTick flag to designate which do and don't. 
        const expiringHots = state.activeBuffs.filter(function (buff) {return (buff.buffType === "heal" || buff.buffType === "damage") && state.t >= buff.expiration && buff.canPartialTick})
        expiringHots.forEach(buff => {
            const tickRate = buff.tickRate / getHaste(state.currentStats)
            const partialTickPercentage = (buff.next - state.t) / tickRate;
            const spell = buff.attSpell;
            spell.coeff = spell.coeff * partialTickPercentage;
            
            if (buff.buffType === "damage") runDamage(state, spell, buff.name + " (dot)", atonementApp);
            else if (buff.buffType === "heal") runHeal(state, spell, buff.name + " (hot)")
        })

        // Remove any buffs that have expired. Note that we call this after we handle partial ticks. 
        state.activeBuffs = state.activeBuffs.filter(function (buff) {return buff.expiration > state.t});

        // This is a check of the current time stamp against the tick our GCD ends and we can begin our queued spell.
        // It'll also auto-cast Ascended Eruption if Boon expired.
        if ((state.t > nextSpell && seq.length > 0))  {
            const spellName = seq.shift();
            const fullSpell = discSpells[spellName];

            // Update current stats for this combat tick.
            // Effectively base stats + any current stat buffs.
            let currentStats = {...stats};
            state.currentStats = getCurrentStats(currentStats, state.activeBuffs);

            // We'll iterate through the different effects the spell has.
            // Smite for example would just trigger damage (and resulting atonement healing), whereas something like Mind Blast would trigger two effects (damage,
            // and the absorb effect).
            state.manaSpent += fullSpell[0].cost;
            fullSpell.forEach(spell => {

                // The spell is an atonement applicator. Add atonement expiry time to our array.
                // The spell data will tell us whether to apply atonement at the start or end of the cast.
                if (spell.atonement) {
                    for (var i = 0; i < spell.targets; i++) {
                        let atoneDuration = spell.atonement;
                        //if (settings['Clarity of Mind'] && (spellName === "Power Word: Shield") && checkBuffActive(state.activeBuffs, "Rapture")) atoneDuration += 6;
                        if (spell.atonementPos === "start") atonementApp.push(state.t + atoneDuration);
                        else if (spell.atonementPos === "end") atonementApp.push(state.t + spell.castTime + atoneDuration);

                    }
                }
        
                // The spell has a healing component. Add it's effective healing.
                // Power Word: Shield is included as a heal, since there is no functional difference for the purpose of this calculation.
                if (spell.type === 'heal') {
                    runHeal(state, spell, spellName)
                }
                
                // The spell has a damage component. Add it to our damage meter, and heal based on how many atonements are out.
                else if (spell.type === 'damage') {
                    runDamage(state, spell, spellName, atonementApp)
                }

                // The spell extends atonements already active. This is specific to Evanglism. 
                else if (spell.type === "atonementExtension") {
                    extendActiveAtonements(atonementApp, state.t, spell.extension);
                }
                // The spell extends atonements already active. This is specific to Evanglism. 
                else if (spell.type === "buffExtension") {
                    extendBuff(state.activeBuffs, state.t, spell.buffName, spell.extension);
                }
                // The spell extends atonements already active. This is specific to Evanglism. 
                else if (spell.type === "function") {
                    spell.runFunc(state, atonementApp);
                }

                // The spell adds a buff to our player.
                // We'll track what kind of buff, and when it expires.
                else if (spell.type === "buff") {
                    addBuff(state, spell, spellName);
                }

                // These are special exceptions where we need to write something special that can't be as easily generalized.
                // Penance will queue either 3 or 6 ticks depending on if we have a Penitent One proc or not. 
                // These ticks are queued at the front of our array and will take place immediately. 
                // This can be remade to work with any given number of ticks.
                else if (spellName === "Penance" || spellName === "DefPenance") {
                    
                    let penanceBolts = discSpells[spellName][0].bolts;
                    let penanceCoeff = discSpells[spellName][0].coeff;
                    let penTickName = spellName === "Penance" ? "PenanceTick" : "DefPenanceTick";

                    if (checkBuffActive(state.activeBuffs, "Penitent One")) {
                        penanceBolts += 3;
                        removeBuffStack(state.activeBuffs, "Penitent One"); 
                    }
                    else if (checkBuffActive(state.activeBuffs, "Harsh Discipline")) {
                        penanceBolts += 3;
                        removeBuffStack(state.activeBuffs, "Harsh Discipline");
                    }

                    discSpells[penTickName][0].castTime = 2 / penanceBolts;
                    discSpells[penTickName][0].coeff = penanceCoeff;
                    for (var i = 0; i < penanceBolts; i++) {
                        seq.unshift(penTickName);
                    }
                }

                if (state.talents.twilightEquilibrium && spell.type === 'damage') {
                    // If we cast a damage spell and have Twilight Equilibrium then we'll add a 6s buff that 
                    // increases the power of our next cast of the opposite school by 15%.

                    if ('school' in spell && spell.school === "holy") {
                        // Check if buff already exists, if it does add a stack.
                        const buffStacks = state.activeBuffs.filter(function (buff) {return buff.name === "Twilight Equilibrium - Shadow"}).length;
                        if (buffStacks === 0) state.activeBuffs.push({name: "Twilight Equilibrium - Shadow", expiration: (state.t + spell.castTime + 6) || 999, buffType: "special", value: 1.15, stacks: 1, canStack: false});
                        else {
                            const buff = state.activeBuffs.filter(buff => buff.name === "Twilight Equilibrium - Shadow")[0]
                            buff.expiration = state.t + spell.castTime + 6;
                        }
                    }
                    else if ('school' in spell && spell.school === "shadow") {
                        // Check if buff already exists, if it does add a stack.
                        const buffStacks = state.activeBuffs.filter(function (buff) {return buff.name === "Twilight Equilibrium - Holy"}).length;
                        if (buffStacks === 0) state.activeBuffs.push({name: "Twilight Equilibrium - Holy", expiration: (state.t + spell.castTime + 6) || 999, buffType: "special", value: 1.15, stacks: 1, canStack: false});
                        else {
                            const buff = state.activeBuffs.filter(buff => buff.name === "Twilight Equilibrium - Holy")[0]
                            buff.expiration = state.t + spell.castTime + 6;
                        }
                    }
                    // If Spell doesn't have a school, or if it does and it's not Holy / Shadow, then ignore.


                }

                // Penance ticks are a bit weird and need to be cleaned up when we're done with them. 
                if (spellName === "PenanceTick" && seq[0] !== "PenanceTick") penanceCleanup(state);
                
                // Grab the next timestamp we are able to cast our next spell. This is equal to whatever is higher of a spells cast time or the GCD.
                
            });   
            nextSpell += (fullSpell[0].castTime / getHaste(currentStats));
        }
    }


    // Add up our healing values (including atonement) and return it.
    const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);
    state.totalDamage = Object.keys(state.damageDone).length > 0 ? Math.round(sumValues(state.damageDone)) : 0;
    state.totalHealing = Object.keys(state.healingDone).length > 0 ? Math.round(sumValues(state.healingDone)) : 0;
    state.hps = (state.totalHealing / sequenceLength);
    state.dps = (state.totalDamage / sequenceLength);
    state.hpm = (state.totalHealing / state.manaSpent) || 0;

    return state;

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


