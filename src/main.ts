import "./style.css";
import { WeatherStation, type WeatherData } from "./WeatherStation";
import {
  CurrentConditionsDisplay,
  ThermometerDisplay,
  HistoryChart,
  AlertDisplay,
} from "./displays";

/**
 * UI wiring for the Observer demo — STARTER version.
 *
 * The app runs, but it misbehaves. As you use it in the browser, note what is
 * broken, then read the source to figure out why:
 *
 *    • the history chart never draws            → see TODO #1 in displays.ts
 *    • the alert panel never reacts             → see TODO #2 in WeatherStation.ts
 *    • the on/off switches don't really work     → see TODO #4 below
 *
 * The deeper problem behind all of this is that WeatherStation is welded to the
 * concrete display classes. Fix the design and the bugs get much easier to kill.
 */

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <header>
    <span class="kicker">Behavioral pattern · STARTER</span>
    <h1>The Observer pattern</h1>
    <p>
      One object changes — many objects react. The <strong>weather station</strong>
      is the <em>subject</em>; the four cards are the <em>observers</em>. This
      starter wires them together the wrong way. Find the problems and fix them.
    </p>
  </header>

  <div class="layout">
    <section class="panel subject">
      <span class="kicker">Subject</span>
      <h2>🛰️ Weather station</h2>
      <p class="sub">Change a reading. Every display should react.</p>

      <div class="slider-row">
        <label for="temp">Temperature</label>
        <input id="temp" type="range" min="-10" max="45" step="0.5" value="21" />
        <output id="temp-out">21 °C</output>
      </div>
      <div class="slider-row">
        <label for="hum">Humidity</label>
        <input id="hum" type="range" min="0" max="100" step="1" value="45" />
        <output id="hum-out">45 %</output>
      </div>
      <div class="slider-row">
        <label for="pres">Pressure</label>
        <input id="pres" type="range" min="960" max="1050" step="1" value="1013" />
        <output id="pres-out">1013 hPa</output>
      </div>

      <div class="scenarios">
        <button data-scenario="heatwave">🔥 Heatwave</button>
        <button data-scenario="freeze">❄️ Cold snap</button>
        <button data-scenario="random" class="ghost">🎲 Random gust</button>
      </div>

      <div class="notice">
        Each card's switch is supposed to <code>subscribe()</code> /
        <code>unsubscribe()</code> that observer at runtime — right now it only
        dims the card. (See TODO #4.)
      </div>
    </section>

    <section class="observers">
      <span class="kicker">Observers</span>
      <p class="sub">Toggle a card on or off — does it actually stop updating?</p>
      <div class="grid" id="grid"></div>
    </section>
  </div>

  <footer>
    Vanilla TypeScript + Vite · STARTER — your task is to refactor this into a
    proper Observer pattern. See the assignment handout.
  </footer>
`;

// --- Build the observer cards (markup only) ----------------------------------

interface CardSpec {
  id: string;
  title: string;
  blurb: string;
}

const specs: CardSpec[] = [
  { id: "conditions", title: "📋 Current conditions", blurb: "Plain numeric readout" },
  { id: "thermo", title: "🌡️ Thermometer", blurb: "Mercury tracks temperature" },
  { id: "chart", title: "📈 History chart", blurb: "Keeps its own running history" },
  { id: "alert", title: "🚨 Alert panel", blurb: "Only reacts outside a safe band" },
];

const grid = document.querySelector<HTMLElement>("#grid")!;
for (const spec of specs) {
  const card = document.createElement("div");
  card.className = "card subscribed";
  card.innerHTML = `
    <div class="card-head">
      <div>
        <div class="card-title">${spec.title}</div>
        <div class="card-blurb">${spec.blurb}</div>
      </div>
      <label class="switch">
        <input type="checkbox" checked data-id="${spec.id}" />
        <span class="track"></span>
      </label>
    </div>
    <div class="card-body" id="body-${spec.id}"></div>`;
  grid.append(card);
}

// --- Create the displays and hand them to the station ------------------------
// 🚩 SMELL: main.ts has to construct every display AND pass each one to the
//    station's constructor in exactly the right order.

const conditions = new CurrentConditionsDisplay(document.querySelector("#body-conditions")!);
const thermometer = new ThermometerDisplay(document.querySelector("#body-thermo")!);
const chart = new HistoryChart(document.querySelector("#body-chart")!);
const alert = new AlertDisplay(document.querySelector("#body-alert")!);

const station = new WeatherStation(conditions, thermometer, chart, alert);

// --- Toggle switches ---------------------------------------------------------

grid.addEventListener("change", (e) => {
  const input = e.target as HTMLInputElement;
  const id = input.dataset.id;
  if (!id) return;
  const card = input.closest(".card")!;

  // ❌ TODO #4: this only dims the card. It does NOT actually detach the display
  //    from the station, so a "switched off" card keeps updating. Once the
  //    station supports subscribe()/unsubscribe(), call them here instead.
  card.classList.toggle("subscribed", input.checked);
});

// --- Subject controls --------------------------------------------------------

const sliders: Array<[string, string, keyof WeatherData, string]> = [
  ["temp", "temp-out", "temperature", "°C"],
  ["hum", "hum-out", "humidity", "%"],
  ["pres", "pres-out", "pressure", "hPa"],
];

for (const [inputId, outId, field, unit] of sliders) {
  const input = document.querySelector<HTMLInputElement>(`#${inputId}`)!;
  const out = document.querySelector<HTMLOutputElement>(`#${outId}`)!;
  input.addEventListener("input", () => {
    const value = Number(input.value);
    out.textContent = `${value} ${unit}`;
    station.setMeasurements({ [field]: value } as Partial<WeatherData>);
  });
}

const syncSliders = (r: WeatherData) => {
  const set = (id: string, outId: string, v: number, unit: string) => {
    document.querySelector<HTMLInputElement>(`#${id}`)!.value = String(v);
    document.querySelector<HTMLOutputElement>(`#${outId}`)!.textContent = `${v} ${unit}`;
  };
  set("temp", "temp-out", r.temperature, "°C");
  set("hum", "hum-out", r.humidity, "%");
  set("pres", "pres-out", r.pressure, "hPa");
};

document.querySelector(".scenarios")!.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-scenario]");
  if (!btn) return;
  let reading: WeatherData;
  switch (btn.dataset.scenario) {
    case "heatwave":
      reading = { temperature: 39, humidity: 20, pressure: 1008 };
      break;
    case "freeze":
      reading = { temperature: -4, humidity: 80, pressure: 1030 };
      break;
    default: {
      const rnd = (lo: number, hi: number) => Math.round((lo + Math.random() * (hi - lo)) * 10) / 10;
      reading = { temperature: rnd(-10, 45), humidity: rnd(0, 100), pressure: rnd(960, 1050) };
    }
  }
  syncSliders(reading);
  station.setMeasurements(reading);
});

// First broadcast so the cards aren't empty on load.
station.setMeasurements(station.current);
