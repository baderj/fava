<script lang="ts">
  import { extent, max, merge, min } from "d3-array";
  import { axisBottom, axisLeft } from "d3-axis";
  import { quadtree } from "d3-quadtree";
  import { scaleLinear, scaleUtc } from "d3-scale";
  import { area, curveStepAfter, line } from "d3-shape";
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";

  import { ctx } from "../format";
  import { lineChartMode } from "../stores/chart";

  import { axis } from "./axis";
  import { currenciesScale } from "./helpers";
  import { positionedTooltip } from "./tooltip";

  import type { LineChart, LineChartDatum } from ".";

  export let data: LineChart["data"];
  export let width: number;
  export let tooltipText: LineChart["tooltipText"];

  const margin = {
    top: 10,
    right: 10,
    bottom: 30,
    left: 40,
  };
  const height = 250;
  $: innerWidth = width - margin.left - margin.right;
  $: innerHeight = height - margin.top - margin.bottom;

  const legend: Writable<[string, string][]> = getContext("chart-legend");
  $: legend.set(
    data
      .map((d) => d.name)
      .sort()
      .map((c) => [c, $currenciesScale(c)])
  );

  // Scales
  $: allValues = merge<LineChartDatum>(data.map((d) => d.values));

  $: xDomain = [
    min(data, (s) => s.values[0].date) ?? 0,
    max(data, (s) => s.values[s.values.length - 1].date) ?? 0,
  ];
  $: x = scaleUtc().domain(xDomain).range([0, innerWidth]);
  let yMin = 0;
  let yMax = 0;
  $: [yMin = 0, yMax = 0] = extent(allValues, (v) => v.value);
  // Span y-axis as max minus min value plus 5 percent margin
  $: y = scaleLinear()
    .domain([yMin - (yMax - yMin) * 0.05, yMax + (yMax - yMin) * 0.05])
    .range([innerHeight, 0]);

  // Quadtree for hover.
  $: quad = quadtree(
    allValues,
    (d) => x(d.date),
    (d) => y(d.value)
  );

  $: lineShape = line<LineChartDatum>()
    .x((d) => x(d.date))
    .y((d) => y(d.value))
    .curve(curveStepAfter);

  $: areaShape = area<LineChartDatum>()
    .x((d) => x(d.date))
    .y1((d) => y(d.value))
    .y0(Math.min(innerHeight, y(0)))
    .curve(curveStepAfter);

  // Axes
  $: xAxis = axisBottom(x).tickSizeOuter(0);
  $: yAxis = axisLeft(y)
    .tickPadding(6)
    .tickSize(-innerWidth)
    .tickFormat($ctx.short);

  function tooltipInfo(
    xPos: number,
    yPos: number
  ): [number, number, string] | undefined {
    const d = quad.find(xPos, yPos);
    return d ? [x(d.date), y(d.value), tooltipText($ctx, d)] : undefined;
  }
</script>

<svg {width} {height}>
  <g
    use:positionedTooltip={tooltipInfo}
    transform={`translate(${margin.left},${margin.top})`}
  >
    <g
      class="x axis"
      use:axis={xAxis}
      transform={`translate(0,${innerHeight})`}
    />
    <g class="y axis" use:axis={yAxis} />
    {#if $lineChartMode === "area"}
      <g class="area">
        {#each data as d}
          <path
            d={areaShape(d.values) ?? undefined}
            fill={$currenciesScale(d.name)}
          />
        {/each}
      </g>
    {/if}
    <g class="lines">
      {#each data as d}
        <path
          d={lineShape(d.values) ?? undefined}
          stroke={$currenciesScale(d.name)}
        />
      {/each}
    </g>
    {#if $lineChartMode !== "area"}
      <g>
        {#each data as d}
          <g fill={$currenciesScale(d.name)}>
            {#each d.values as v}
              <circle r="2" cx={x(v.date)} cy={y(v.value)} />
            {/each}
          </g>
        {/each}
      </g>
    {/if}
  </g>
</svg>

<style>
  svg > g {
    pointer-events: all;
  }
  .lines path {
    fill: none;
    stroke-width: 2px;
  }
  .area path {
    opacity: 0.3;
  }
</style>
