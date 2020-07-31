<script>
  import { partition } from "d3-hierarchy";
  import { scaleLinear, scaleSqrt } from "d3-scale";
  import { arc } from "d3-shape";
  import { derived } from "svelte/store";

  import { accounts } from "../stores";

  import router from "../router";
  import { accountUrl } from "../helpers";
  import { sunburstScale, getColor } from "./helpers";
  import { formatCurrency, formatPercentage } from "../format";

  export let data;
  export let currency;
  export let width;
  export let height;
  const offset = 11;
  $: radius = Math.min(width, height) / 2;
  $: myRound = (d) => {
    return ` ${Math.round(d)}`;
  };

  function balanceText(d) {
    let value = Math.floor(d.value);
    if (value >= 99999) {
      value = `${Math.floor(value / 1000)}k`;
    }

    return `${value} ${currency} (${formatPercentage(d.value / root.value)})`;
  }
  function blabla(d) {
    console.log("blabla", d);
  }
  $: root = partition()(data);
  $: leaves = root.descendants().filter((d) => !d.data.dummy && d.depth);
  $: justName = (n) => {
    const els = n.split(":");
    const last = els.pop();
    return last;
  };

  let current = null;
  $: if (root) {
    current = null;
  }
  $: currentAccount = current ? current.data.account : root.data.account;
  $: currentBalance = current ? balanceText(current) : balanceText(root);

  const x = scaleLinear().range([0, 2 * Math.PI]);
  $: y = scaleSqrt().range([0, radius]);
  $: arcShape = arc()
    .startAngle((d) => x(d.x0))
    .endAngle((d) => x(d.x1))
    .innerRadius((d) => y(d.y0))
    .outerRadius((d) => 0.98 * y(d.y1));
</script>

<style>
  .half {
    opacity: 0.5;
  }
</style>

<g
  {width}
  {height}
  transform={`translate(${height / 2},${height / 2})`}
  on:mouseleave={() => {
    current = null;
  }}>
  <circle style="opacity:0" r={radius} />
  <text class="account" text-anchor="middle">
    {currentAccount || root.data.account}
  </text>
  <text class="balance" dy="1.2em" text-anchor="middle">{currentBalance}</text>
  {#each leaves as d}
    <path
      on:click={() => router.navigate(accountUrl(d.data.account))}
      on:mouseover={() => {
        current = d;
      }}
      class:half={current && !currentAccount.startsWith(d.data.account)}
      fill-rule="evenodd"
      stroke="white"
      stroke-width="2"
      fill={getColor(d)}
      d={arcShape(d)} />
  {/each}
</g>

<g transform={`translate(${height * 1.1},${height / 10})`}>
  {#if root.children.length > 3}
    {#each root.children as d, i}
      {#if d.children}
        <g
          transform={`translate(${Math.floor(i / 5) * 400}, ${(i % 5) * 13 * (5 + 2)})`}>
          <rect x="-10" y="-15" width="15" height="15" fill={getColor(d)} />
          <text class="main" dx="13">
            {justName(d.data.account)} - {balanceText(d)}
          </text>

          {#each Array(5) as _, j}
            <g transform={`translate(13, ${(j + 1) * 13})`}>
              {#if d.children.length > j && d.children[j].value > 0.0}
                <rect
                  x="0"
                  y="-10"
                  width="10"
                  height="10"
                  fill={getColor(d.children[j])} />
                <text class="sub" dx="13">
                  {justName(d.children[j].data.account)} - {balanceText(d.children[j])}
                </text>
                <!-- <text class="sub" dx="13">{root.children.length}</text> -->
              {/if}
            </g>
          {/each}

        </g>
      {/if}
    {/each}
  {:else}
    {#each root.children as d, i}
      {#if d.children}
        <g transform={`translate(${i * 400}, 0)`}>
          <rect x="-10" y="-15" width="15" height="15" fill={getColor(d)} />
          <text class="main" dx="13">
            {justName(d.data.account)} - {balanceText(d)}
          </text>
          {#each Array(5) as _, j}
            <g transform={`translate(13, ${j * 100 + 20})`}>
              {#if d.children.length > j && d.children[j].value > 0.0}
                <rect
                  x="0"
                  y="-10"
                  width="10"
                  height="10"
                  fill={getColor(d.children[j])} />
                <text class="main" dx="13">
                  {justName(d.children[j].data.account)} - {balanceText(d.children[j])}
                </text>
                {#each Array(5) as _, k}
                  <g transform={`translate(13, ${(k + 1) * 13 + 5})`}>
                    {#if 'children' in d.children[j] && d.children[j].children.length > k && d.children[j].children[k].value > 0.0}
                      <rect
                        x="0"
                        y="-10"
                        width="10"
                        height="10"
                        fill={getColor(d.children[j].children[k])} />
                      <text class="sub" dx="13">
                        {justName(d.children[j].children[k].data.account)} - {balanceText(d.children[j].children[k])}
                      </text>
                    {/if}
                  </g>
                {/each}
              {/if}
            </g>
          {/each}

        </g>
      {/if}
    {/each}
  {/if}
</g>
