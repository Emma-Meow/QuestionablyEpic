import React, { PureComponent } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, CartesianGrid, Tooltip } from "recharts";
// import chroma from "chroma-js";
import { getItemIcon, getTranslatedItemName } from "../../../Engine/ItemUtilities";
import "./VerticalChart.css";
import i18n from "i18next";

const getLevelDiff = (trinketName, db, ilvl, map2) => {
  /* ---------- Check if item exists at item level. If not, return 0. --------- */
  let temp = db.filter(function (item) {
    return item.name === trinketName;
  });

  const item = temp[0];
  const pos = item.levelRange.indexOf(ilvl);
  const previousLevel = item.levelRange[pos - 1];

  /* ----------- Return item score - the previous item levels score. ---------- */
  if (pos > 0) {
    // added a or 0 to handle NANs
    return map2["i" + ilvl] - map2["i" + previousLevel] || 0;
  } else if (pos == 0) {
    return map2["i" + ilvl];
  } else {
    return 0;
  }
};

/* ------------------------ Cleans Zeros from Objects ----------------------- */
const cleanZerosFromArray = (obj) => {
  return Object.keys(obj)
    .filter((key) => {
      return obj[key] !== 0;
    })
    .reduce((object, key) => {
      object[key] = obj[key];
      return object;
    }, {});
};

const truncateString = (str, num) => {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
};
export default class BCChart extends PureComponent {
  constructor() {
    super();
  }
  render() {
    const currentLanguage = i18n.language;
    const data = this.props.data;
    const db = this.props.db;
    
    let arr = [];
    let cleanedArray = [];
    console.log(data);
    Object.entries(data)
      .map((key) => key[1])
      .map((map2) => {
        arr.push({
          name: map2.id,
          //i161: map2.i161,
          100: map2.i100,
        });
      });

    /* ------------ Map new Array of Cleaned Objects (No Zero Values) ----------- */
    arr.map((key) => cleanedArray.push(cleanZerosFromArray(key)));

    /* ----------------------- Y-Axis Label Customization ----------------------- */
    const CustomizedYAxisTick = (props) => {
      const { x, y, payload } = props;
      return (
        <g transform={`translate(${x},${y})`}>
          <foreignObject x={-300} y={-10} width="300" height="22" style={{ textAlign: "right" }}>
            <text x={0} y={-10} style={{ color: "#fff", marginRight: 5, verticalAlign: "top", position: "relative", top: 2 }}>
              {truncateString(getTranslatedItemName(payload.value, currentLanguage, "", "BurningCrusade"), 32)}
            </text>
            <a data-wowhead={"item=" + payload.value + "&ilvl=200" + "&domain=tbc-" + currentLanguage}>
              <img width={20} height={20} x={0} y={0} src={getItemIcon(payload.value, "BurningCrusade")} style={{ borderRadius: 4, border: "1px solid rgba(255, 255, 255, 0.12)" }} />
            </a>
          </foreignObject>
        </g>
      );
    };

    return (
      <ResponsiveContainer className="ResponsiveContainer2" width="100%" aspect={2}>
        <BarChart
          barCategoryGap="15%"
          data={cleanedArray}
          layout="vertical"
          margin={{
            top: 20,
            right: 40,
            bottom: 20,
            left: 250,
          }}
        >
          <XAxis type="number" stroke="#f5f5f5" axisLine={false} />
          <XAxis type="number" stroke="#f5f5f5" orientation="top" xAxisId={1} padding={0} height={1} axisLine={false} />
          <Tooltip
            labelStyle={{ color: "#ffffff" }}
            contentStyle={{
              backgroundColor: "#1b1b1b",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
            labelFormatter={(timeStr) => getTranslatedItemName(timeStr, currentLanguage, "", "BurningCrusade")}
            formatter={(value, name, props) => {
              {
                if (value > 0) {
                  return [
                    data
                      .filter((filter) => filter.id === props["payload"].name)
                      .map((key) => key["i" + name])
                      .toString(),
                    name,
                  ];
                } else {
                  return ["Unobtainable", name];
                }
              }
            }}
          />
          <Legend verticalAlign="top" />
          <CartesianGrid vertical={true} horizontal={false} />
          <YAxis type="category" dataKey="name" stroke="#f5f5f5" interval={0} tick={CustomizedYAxisTick} />
          {/*<Bar dataKey={"i161"} fill={"#eee8aa"} stackId="a" /> */}
          {/*<Bar dataKey={"i174"} fill={"#9BB5DD"} stackId="a" /> */}
          <Bar dataKey={100} fill={"#e6bc53"} stackId="a" />

        </BarChart>
      </ResponsiveContainer>
    );
  }
}