import { hcl, color } from "d3-color";
import { scaleOrdinal } from "d3-scale";
import { get, derived } from "svelte/store";

import { accounts, operating_currency, commodities } from "../stores";
import { time_filter } from "../stores/filters";
import { currentTimeFilterDateFormat } from "../format";

export function setTimeFilter(date: Date): void {
  time_filter.set(get(currentTimeFilterDateFormat)(date));
}

/*
 * Generate an array of colors.
 *
 * Uses the HCL color space in an attempt to generate colours that are
 * to be perceived to be of the same brightness.
 */
function hclColorRange(count: number, chroma = 45, lightness = 70): string[] {
  const offset = 270;
  const delta = 360 / count;
  const colors = [...Array(count).keys()].map((index) => {
    const hue = (index * delta + offset) % 360;
    return hcl(hue, chroma, lightness);
  });
  return colors.map((c) => c.toString());
}

// export function colorMapper(account: string):boolean {
//   return
// }

const colors = [
  "#f14a41",
  "#f46c3c",
  "#f79031",
  "#fcb819",
  "#ffdf01",
  "#f4e91d",
  "#d1dc26",
  "#b3d334",
  "#9bc83a",
  "#87c540",
  "#81c67f",
  "#7ecfd0",
  "#77cdeb",
  "#5cbdea",
  "#5c90c7",
  "#4d6eb5",
  "#6a58a4",
  "#9f62aa",
  "#b55fa6",
  "#f0478f",
];

const colorSchemes = [
  [7],
  [7, 0],
  [7, 13, 0],
  [7, 13, 0, 2],
  [0, 2, 7, 13, 19],
  [0, 2, 4, 7, 13, 19],
  [0, 2, 4, 7, 13, 16, 19],
  [0, 2, 4, 7, 10, 13, 16, 19],
  [0, 2, 4, 7, 10, 13, 16, 19, 1],
  [0, 2, 4, 7, 10, 13, 16, 19, 1, 3],
  [0, 2, 4, 7, 10, 13, 16, 19, 1, 3, 8],
  [0, 2, 4, 7, 10, 13, 16, 19, 1, 3, 8, 18],
  [0, 2, 4, 7, 10, 13, 16, 19, 1, 3, 6, 8, 18],
  [0, 2, 4, 7, 10, 13, 16, 19, 1, 3, 6, 8, 11, 18],
  [0, 2, 4, 7, 10, 13, 16, 19, 1, 3, 6, 8, 11, 15, 18],
  [0, 2, 4, 7, 10, 13, 16, 19, 1, 3, 5, 6, 8, 11, 15, 18],
  [0, 2, 4, 7, 10, 13, 16, 19, 1, 3, 5, 6, 8, 9, 11, 15, 18],
  [0, 2, 4, 7, 10, 13, 16, 19, 1, 3, 5, 6, 8, 9, 11, 12, 15, 18],
  [0, 2, 4, 7, 10, 13, 16, 19, 1, 3, 5, 6, 8, 9, 11, 12, 14, 15, 18],
  [0, 2, 4, 7, 10, 13, 16, 19, 1, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18],
];

function colorsNr(count: number) {
  let indexes;
  if (count >= colorSchemes.length) {
    indexes = colorSchemes[colorSchemes.length - 1];
  } else {
    indexes = colorSchemes[count - 1];
  }
  const cols: Array<string> = [];
  indexes.forEach((i) => {
    cols.push(colors[i]);
  });
  return cols;
}

export function getColor(data: any): string {
  const total = data.parent.children.length;
  const { account } = data.data;
  let cs = colorSchemes[colorSchemes.length - 1];
  if (total < colorSchemes.length) {
    cs = colorSchemes[total];
  }
  const hey = "";
  for (let i = 0; i < total; i += 1) {
    if (data.parent.children[i].data.account === account) {
      if (data.depth === 1) {
        return colors[cs[i]];
      }
      if (data.depth > 1) {
        const cc = color(getColor(data.parent));
        if (cc) {
          return cc.darker((i + 1) / 3.0).hex();
        }
      }
    }
  }
  return "#000000";
}

export const colors10 = hclColorRange(10);
export const colors15 = hclColorRange(15, 30, 80);

/*
 * The color scales for the charts.
 *
 * The scales for treemap and sunburst charts will be initialised with all
 * accounts on page init and currencies with all commodities.
 */
export const scatterplotScale = scaleOrdinal(colorsNr(10));

export const treemapScale = derived(accounts, (accounts_val) =>
  scaleOrdinal(colorsNr(accounts_val.length)).domain(accounts_val)
);

export const sunburstScale = derived(accounts, (accounts_val) =>
  scaleOrdinal(colorsNr(accounts_val.length)).domain(accounts_val)
);

export const currenciesScale = derived(
  [operating_currency, commodities],
  ([operating_currency_val, commodities_val]) =>
    scaleOrdinal(colorsNr(1)).domain([
      ...operating_currency_val,
      ...commodities_val,
    ])
);
