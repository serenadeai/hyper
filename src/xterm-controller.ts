import { Terminal } from "xterm";
import { cursorMove } from "ansi-escapes";

const debug = false;
const log = (...args: any[]) => {
  if (debug) {
    console.log(...args);
  }
};

/*
    Controls Xterm.js's representation of the underlying terminal using
    escape codes and buffer diffs.
 */

export class XtermController {
  private preCommandBuffer: string[] = [];
  private command: string = "";
  private cursor: number = 0;

  private clearedState = true;

  constructor(public term?: Terminal) {
    if (term) {
      this.updateTerm(term);
    }
  }

  updateTerm(term: Terminal) {
    this.term = term;
    // Register handlers.
    this.registerHandlers(term);
    term.onRender(() => {
      log("onRender", "clearedState", this.clearedState);

      if (!this.clearedState) {
        this.savePreviousState();
        this.clearedState = true;
        log("state", this.state());
      }
    });
  }

  private registerHandlers(term: Terminal) {
    term.parser.registerOscHandler(133, (data) => {
      switch (data[0]) {
        case "A":
          log("Prompt started");
          break;
        case "B":
          log("Command start");
          this.clearedState = false;
          // this.savePreviousState();
          log("state", this.state());
          break;
        case "C":
          log("Command executed");
          log("state", this.state());
          this.savePreviousState();
          break;
        case "D":
          log("Command finished");
          this.savePreviousState();
          log("state", this.state());
          break;
        default:
          console.warn("Unknown code", data);
      }

      return true;
    });
  }

  state = () => {
    this.updateState();
    return {
      source: this.command,
      cursor: this.cursor,
    };
  };

  setCursor = (cursor: number) => {
    this.updateState();
    log("adjusting cursor by", cursor - this.cursor);
    this.term?.write(cursorMove(cursor - this.cursor));
  };

  erase = (count: number) => {
    if (count) {
      this.term?.write("\u001B[" + count + "\b");
    }
  };

  write = (diff: string) => {
    this.term?.write(diff);
  };

  private updateState = () => {
    if (this.term === undefined) {
      return;
    }

    let command = "";
    let cursor = 0;

    const count = (substring: string, y: number, offset: number = 0) => {
      // Ignore empty lines
      if (substring === "") {
        return;
      }

      command += substring + "\n";
      // If we haven't reached the row of the cursor, add the length of the substring
      if (y < this.term!.buffer.cursorY) {
        cursor += substring.length + 1;
      }

      // If we're on the row of the cursor, add up to the column of the cursor, minus the offset
      if (y === this.term!.buffer.cursorY) {
        cursor += this.term!.buffer.cursorX - offset;
      }
    };

    // Look at every row in the buffer
    for (let i = 0; i < this.term!.buffer.length; i++) {
      const currentLine = this.term!.buffer.getLine(i)?.translateToString().trimRight() || "";
      // If this line is the same as before, skip
      if (currentLine === this.preCommandBuffer[i]) {
        continue;
      }

      let substring = currentLine;
      let offset = 0;

      // Compare to the previous buffer to get a substring and offset
      if (this.preCommandBuffer[i]) {
        for (let j = 0; j < this.preCommandBuffer[i].length; j++) {
          if (currentLine[j] !== this.preCommandBuffer[i][j]) {
            substring = currentLine.substring(j);
            offset = j;
            break;
          }
        }
      }

      count(substring, i, offset);
    }

    this.command = command;
    this.cursor = cursor;
  };

  private savePreviousState = () => {
    this.preCommandBuffer = [];
    for (let i = 0; i < this.term!.buffer.length; i++) {
      this.preCommandBuffer.push(this.term!.buffer.getLine(i)?.translateToString() || "");
    }
  };
}
