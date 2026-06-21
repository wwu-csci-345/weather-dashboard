# Weather dashboard

This is the **starter** code for the weather dashboard app. The app
runs, but it is wired together badly and has a few bugs. Your job is to read the
code, find the problems, and refactor it into a proper Observer pattern.

See the assignment handout for the full instructions and grading. The four
`TODO` markers in the source are your checklist:

| TODO | File | What's wrong |
| --- | --- | --- |
| #1 | `src/displays.ts` | `HistoryChart.update()` is empty — the chart never draws. |
| #2 | `src/WeatherStation.ts` | One display is missing from the manual update list — the alert never reacts. |
| #3 | `src/WeatherStation.ts` | No `Observer` interface and no `subscribe()/unsubscribe()/notify()`. |
| #4 | `src/main.ts` | The on/off switches only dim the card; they don't actually detach the observer. |

## Run it

```bash
npm install
npm run dev      # open the printed localhost URL and try the sliders
```

Try the sliders and the 🔥 / ❄️ buttons first, and watch which cards *don't*
react. That's your bug list.
