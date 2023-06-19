import React, { Component } from "react";
import moment from "moment";
import { MenuItem } from "@mui/material";
import bossIcons from "../../Modules/CooldownPlanner/Functions/IconFunctions/BossIcons";
import { fightDuration, logDifficulty } from "../../Modules/CooldownPlanner/Functions/Functions";
import { bossList } from "../../Modules/CooldownPlanner/Data/CooldownPlannerBossList";

const API = "https://www.warcraftlogs.com:443/v1/report/fights/";
const API2 = "?api_key=92fc5d4ae86447df22a8c0917c1404dc";
class LogImport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reportid: this.props.reportid,
      fights: [],
      reportidnew: this.props.reportid,
    };
  }
  componentDidMount = () => {
    if (this.state.reportid === null) {
      this.setState({ fights: "No Report" });
    }
    this.setState({ reportid: this.props.reportid });
    fetch(API + this.state.reportid + API2)
      .then((response) => response.json())
      .then((data) => this.setState({ fights: data.fights }));
  };

  killwipe = (check) => {
    return check ? "Kill!" : "Wipe ";
  };

  whichWipe = (fight, list) => {
    return fight.kill ? "" : list[fight.boss + fight.difficulty].indexOf(fight) + 1;
  };

  formatName = (fight, list) => {
    const start = logDifficulty(fight.difficulty) + " " + fight.name + " - " + moment.utc(fightDuration(fight.end_time, fight.start_time)).format("mm:ss") + " - ";

    let end = this.killwipe(fight.kill);
    let styleColor = "#00ff1a";

    //this is very hacky due ot the fact killwipe already checks that...
    if (!fight.kill) {
      end += this.whichWipe(fight, list) + (fight.kill ? "" : " - " + fight.bossPercentage / 100 + "%");
      styleColor = "";
    }

    return <div style={{ color: styleColor }}>{start + end}</div>;
  };

  render() {
    const { fights } = this.state;
    if (this.state.reportid === null) {
      return (
        <MenuItem key={99} value="Fight">
          No Report Loaded
        </MenuItem>
      );
    }

    // Split up fights for indexing
    // limit fights on what we want to prevent bad fights? idk options man
    // const filteredFights = fights.filter(fight => bossList.find(boss => fight.boss === boss.id));
    // filter LFR & Normal logs if cooldownImportFilter === true
    const filteredFights =
      this.props.cooldownImportFilter === true ? fights.filter((name) => name.boss !== 0 && name.difficulty !== 1 && name.difficulty !== 3) : fights.filter((name) => name.boss !== 0);

    // show message if log only contains lfr & normal logs (cooldown import only)
    if (filteredFights.length === 0 && this.props.cooldownImportFilter === true) {
      return (
        <MenuItem key={98} value="noValid">
          No Valid Fights (Only Heroic and Mythic Supported)
        </MenuItem>
      );
    }

    // now we map (i dislike this klunkyness but hey sucks don't it)
    const fightsMapped = {};
    filteredFights.forEach((fight) =>
      fightsMapped[fight.boss + fight.difficulty] ? fightsMapped[fight.boss + fight.difficulty].push(fight) : (fightsMapped[fight.boss + fight.difficulty] = [fight]),
    );

    let menuItems = filteredFights.map((fight, i, arr) => {
      let lastItem = i + 1 === arr.length ? false : true;
      return (
        <MenuItem
          divider={lastItem}
          key={i}
          onClick={() => {
            this.props.clicker([
              fight.start_time,
              fight.end_time,
              fight.name,
              moment.utc(fightDuration(fight.end_time, fight.start_time)).format("mm:ss"),
              this.killwipe(fight.kill) + this.whichWipe(fight, fightsMapped),
              fight.boss,
              fight.difficulty,
              fight.keystoneLevel,
              fight.zoneID ||
                bossList
                  .filter((obj) => {
                    return obj.id === fight.boss;
                  })
                  .map((obj) => obj.zoneID),
            ]);
            this.props.close();
            this.props.update(
              // Used by QELog Import
              fight.start_time,
              fight.end_time,
              this.state.reportid,
              // Used by Cooldown Plan Log Import
              fight.boss,
              fight.difficulty,
            );
          }}
        >
          {bossIcons(fight.boss)}
          {this.formatName(fight, fightsMapped)}
        </MenuItem>
      );
    });
    return menuItems;
  }
}

export default LogImport;
