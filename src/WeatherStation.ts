import {
  CurrentConditionsDisplay,
  ThermometerDisplay,
  HistoryChart,
  AlertDisplay,
} from "./displays";

/** The message every display receives. */
export interface WeatherData {
  /** degrees Celsius */
  temperature: number;
  /** percent, 0–100 */
  humidity: number;
  /** hectopascals */
  pressure: number;
}

/**
 * The weather station: it takes readings and pushes them to the displays.
 *
 * 🚩 This works... sort of. But read it critically — it has a design problem
 *    and at least one bug. Some questions to guide you:
 *
 *      1. How many display classes does this file import and name directly?
 *         What has to change here every time someone adds a new display?
 *      2. Could you add or remove a display *while the app is running*?
 *      3. Look carefully at `setMeasurements`. Are ALL the displays actually
 *         being told about a new reading?
 *
 *    Your job is to break this tight coupling using the Observer pattern.
 */
export class WeatherStation {
  private temperature = 21;
  private humidity = 45;
  private pressure = 1013;

  // 🚩 SMELL: the station hard-codes a reference to every concrete display.
  //    It cannot work with a display it doesn't already know about by name.
  constructor(
    private readonly conditions: CurrentConditionsDisplay,
    private readonly thermometer: ThermometerDisplay,
    private readonly chart: HistoryChart,
    private readonly alert: AlertDisplay,
  ) {}

  get current(): WeatherData {
    return {
      temperature: this.temperature,
      humidity: this.humidity,
      pressure: this.pressure,
    };
  }

  /** Record a new reading and refresh the displays. */
  setMeasurements(reading: Partial<WeatherData>): void {
    if (reading.temperature !== undefined) this.temperature = reading.temperature;
    if (reading.humidity !== undefined) this.humidity = reading.humidity;
    if (reading.pressure !== undefined) this.pressure = reading.pressure;

    // 🚩 SMELL: to "notify" everyone, the station has to call each display by
    //    hand. This list is easy to get wrong...
    this.conditions.update(this.current);
    this.thermometer.update(this.current);
    this.chart.update(this.current);
    // ❌ TODO #2 (bug to find): one display is missing from the list above,
    //    which is why it never reacts. Once you refactor to a real observer
    //    list (below), this whole hand-written block should disappear.
  }

  // ❌ TODO #3: there is no way to subscribe / unsubscribe a display at runtime.
  //    Introduce an Observer interface, keep a collection of observers here, and
  //    add subscribe()/unsubscribe()/notify() so the station no longer needs to
  //    know any concrete display class by name.
}
