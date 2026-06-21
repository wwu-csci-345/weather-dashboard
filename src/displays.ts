import type { WeatherData } from "./WeatherStation";

/**
 * The display widgets.
 *
 * Each one knows how to redraw itself from a WeatherData reading via its
 * `update()` method. Right now they are just four unrelated classes — there is
 * no shared type that says "I am something a weather station can notify."
 *
 * 👀 As you read this file, ask yourself:
 *    - What do all four classes have in common?
 *    - Could the WeatherStation treat them uniformly instead of by name?
 */

const TEMP_MIN = -10;
const TEMP_MAX = 45;
const pct = (t: number) => ((t - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * 100;

/** A plain numeric readout of the latest reading. */
export class CurrentConditionsDisplay {
  constructor(private readonly root: HTMLElement) {}

  update(state: WeatherData): void {
    this.root.innerHTML = `
      <div class="readout">
        <div class="metric">
          <span class="big">${state.temperature.toFixed(1)}<span class="unit">°C</span></span>
          <span class="label">Temperature</span>
        </div>
        <div class="metric">
          <span class="big">${state.humidity.toFixed(0)}<span class="unit">%</span></span>
          <span class="label">Humidity</span>
        </div>
        <div class="metric">
          <span class="big">${state.pressure.toFixed(0)}<span class="unit">hPa</span></span>
          <span class="label">Pressure</span>
        </div>
      </div>`;
  }
}

/** A thermometer whose mercury column tracks the temperature. */
export class ThermometerDisplay {
  constructor(private readonly root: HTMLElement) {}

  update(state: WeatherData): void {
    const fill = Math.max(0, Math.min(100, pct(state.temperature)));
    const hue = 220 - (fill / 100) * 220; // 220 (blue) → 0 (red)
    this.root.innerHTML = `
      <div class="thermo">
        <div class="tube">
          <div class="mercury" style="height:${fill}%;background:hsl(${hue} 85% 55%)"></div>
        </div>
        <div class="bulb" style="background:hsl(${hue} 85% 55%)"></div>
      </div>
      <div class="thermo-val">${state.temperature.toFixed(1)} °C</div>`;
  }
}

/**
 * A rolling line chart of the last N temperatures. It keeps its own history.
 *
 * ❌ TODO #1 — This observer never draws anything: its `update()` is empty.
 *    Implement it so that each new reading is appended to `history` (cap the
 *    list at `maxPoints`) and the SVG polyline below is redrawn.
 *
 *    Hint: build a `points` string of "x,y" pairs. Map each reading's index to
 *    an x in [0, 100] and its temperature to a y, where y = 100 - pct(temp).
 *    The markup you need is:
 *
 *      <svg class="spark" viewBox="0 0 100 100" preserveAspectRatio="none">
 *        <polyline points="..." fill="none" stroke="var(--accent)" stroke-width="2"
 *          vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" />
 *      </svg>
 *      <div class="chart-foot">last N readings</div>
 */
export class HistoryChart {
  private readonly history: number[] = [];
  private readonly maxPoints = 24;

  constructor(private readonly root: HTMLElement) {}

  update(state: WeatherData): void {
    // TODO #1: record `state.temperature` and redraw the chart (see notes above).
  }
}

/** Raises an alarm only when the temperature leaves a safe band. */
export class AlertDisplay {
  private readonly low = 0;
  private readonly high = 35;

  constructor(private readonly root: HTMLElement) {}

  update(state: WeatherData): void {
    let level = "ok";
    let msg = "All readings within normal range.";
    if (state.temperature >= this.high) {
      level = "hot";
      msg = `Heat warning — ${state.temperature.toFixed(1)} °C is above ${this.high} °C.`;
    } else if (state.temperature <= this.low) {
      level = "cold";
      msg = `Freeze warning — ${state.temperature.toFixed(1)} °C is at or below ${this.low} °C.`;
    }
    this.root.innerHTML = `<div class="alert ${level}">${msg}</div>`;
  }
}
