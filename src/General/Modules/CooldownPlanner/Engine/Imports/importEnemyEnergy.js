import axios from "axios";

export default async function importEnemyHealth(starttime, endtime, reportid) {
  const APIdamagetaken = "https://www.warcraftlogs.com:443/v1/report/tables/resources/";
  const API2 = "&api_key=92fc5d4ae86447df22a8c0917c1404dc";
  const START = "?start=";
  const END = "&end=";
  const HOSTILITY = "&hostility=1";
  // const sourceClass = "&sourceclass=Boss";
  const resourceType = "&abilityid=103";
  const translate = "&translate=true";

  let energy = [];

  await axios
    .get(
      APIdamagetaken +
        reportid +
        START +
        starttime +
        END +
        endtime +
        HOSTILITY +
        resourceType +
        // + sourceClass
        translate +
        API2,
    )
    .then((result) => {
      energy = result.data;
      //Object.keys(result.data.events).map((key) => result.data.events[key]);
    })
    .catch(function (error) {
      console.log(error);
    });
  return energy;
}
