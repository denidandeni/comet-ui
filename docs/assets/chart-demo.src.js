// Docs demo for the Chart component. Source for docs/assets/chart-demo.js (npm run build:docs).
// Shows TanStack Charts picking up Comet UI tokens: no colours are set here except through CSS variables.
import { defineChart, barY, lineY, areaY, colorLegend, mountChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal'
import { tooltip } from '@tanstack/charts/tooltip'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const revenue = [42, 58, 76, 64, 81, 93].map((value, i) => ({ month: months[i], revenue: value }))
const fuel = [
  [48, 52, 47, 55, 51, 46],
  [31, 34, 38, 36, 41, 44],
].flatMap((values, s) => values.map((litres, i) => ({ month: months[i], litres, depot: s === 0 ? 'Bandung' : 'Surabaya' })))
const users = [1.2, 1.5, 1.9, 2.1, 2.6, 2.8].map((value, i) => ({ month: months[i], users: value }))

const charts = {
  'demo-chart-bar': {
    label: 'Monthly revenue',
    definition: defineChart({
      marks: [barY(revenue, { x: 'month', y: 'revenue', inset: 3, radius: 4 })],
      scales: {
        x: { scale: () => scaleBand().padding(0.2) },
        y: { scale: scaleLinear, nice: true, grid: true, axis: { label: 'Revenue (Rp million)' } },
      },
      tooltip,
    }),
  },
  'demo-chart-line': {
    label: 'Fuel used per depot',
    definition: defineChart({
      marks: [lineY(fuel, { x: 'month', y: 'litres', z: 'depot', points: true, strokeWidth: 2 })],
      scales: {
        x: { scale: () => scalePoint().padding(0.3) },
        y: { scale: scaleLinear, nice: true, grid: true, axis: { label: 'Fuel (thousand litres)' } },
      },
      color: {
        scale: () => scaleOrdinal().domain(['Bandung', 'Surabaya']).range(['var(--ts-chart-1)', 'var(--ts-chart-2)']),
        legend: colorLegend({ label: 'Depot' }),
      },
      tooltip,
    }),
  },
  'demo-chart-area': {
    label: 'Active users',
    definition: defineChart({
      marks: [
        areaY(users, { x: 'month', y: 'users', fill: 'var(--ts-chart-1)', fillOpacity: 0.15 }),
        lineY(users, { x: 'month', y: 'users', stroke: 'var(--ts-chart-1)', strokeWidth: 2 }),
      ],
      scales: {
        x: { scale: () => scalePoint().padding(0.3) },
        y: { scale: scaleLinear, nice: true, grid: true, axis: { label: 'Users (thousand)' } },
      },
      tooltip,
    }),
  },
}

for (const [id, chart] of Object.entries(charts)) {
  const container = document.getElementById(id)
  if (container) mountChart(container, { definition: chart.definition, height: 240, initialWidth: 480, ariaLabel: chart.label })
}
