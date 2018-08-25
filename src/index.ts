import * as fs from "fs";
import * as promisifyEvent from "promisify-event";
import * as readline from "readline";
import { markNetIdAsAttended } from "./airtable";
import { InvalidSwipe } from "./errors";
import { parseCardSwipe } from "./scan";

interface CurrentState {
  processing?: boolean;
  swipes?: number;
}

/**
 * Initializes the program
 *
 * @returns an object containing the state, a method to set the state, and the readLine interface
 */
function init() {
  const state: CurrentState = {};

  const readLine = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const setState = (s: CurrentState) => {
    Object.assign(state, s);
    console.clear();
    console.log(`There have been ${state.swipes} card swipes.`);
    if (state.processing) {
      console.log(`Processing...`);
    } else {
      console.log(`Ready for next scan...`);
    }
  };

  setState({ processing: false, swipes: 0 });

  return { state, readLine, setState };
}

async function main() {
  const { state, readLine, setState } = init();

  while (true) {
    try {
      const cardSwipeData = await promisifyEvent(readLine, "line");
      const { netId } = parseCardSwipe(cardSwipeData);

      setState({ processing: true, swipes: state.swipes + 1 });
      fs.appendFileSync("scans.txt", `${netId}\n`);

      await markNetIdAsAttended("recPtLhfyj8mgA3jU", netId);

      setState({ processing: false });
    } catch (e) {
      if (e.code === new InvalidSwipe().code) {
        console.error(`Invalid swipe, please try again`);
      } else {
        console.error(`An unknown error occurred, please try again.`);
        fs.appendFileSync("errors.txt", `${e}\n`);
      }
    }
  }
}

main().catch(e => {
  console.error("Unhandled error:");
  console.error(e);
});
