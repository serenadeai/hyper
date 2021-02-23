import { Terminal } from "xterm";

/*
    Controls Xterm.js's representation of the underlying terminal using
    escape codes and buffer diffs.
 */

export class XtermController {
  private preCommandBuffer: string[] = [];

  constructor(public term?: Terminal) {
    if (term) {
      this.updateTerm(term);
    }
  }

  updateTerm(term: Terminal) {
    this.term = term;
    // Register handlers.
    this.registerHandlers();
  }

  private registerHandlers() {
    this.term?.parser.registerOscHandler(133, (data) => {
      switch (data[0]) {
        case "A":
          console.log("Prompt started");
          break;
        case "B":
          console.log("Command start");
          this.savePreviousState();
          break;
        case "C":
          console.log("Command executed");
          console.log(this.diffBuffer());
          this.savePreviousState();
          break;
        case "D":
          console.log("Command finished");
          console.log(this.diffBuffer());
          break;
        default:
          console.log("Unknown code", data);
      }

      return true;
    });
  }

  command = () => {
    return this.diffBuffer();
  };

  selection = () => {
    return null;
  };

  private printBuffer = () => {
    for (let i = 0; i < this.term!.buffer.length; i++) {
      console.log(this.term!.buffer.getLine(i)?.translateToString() || "");
    }
  };

  private diffBuffer = () => {
    let command = "";

    for (let i = 0; i < this.term!.buffer.length; i++) {
      const currentLine = this.term!.buffer.getLine(i)?.translateToString() || "";

      if (currentLine !== this.preCommandBuffer[i]) {
        if (this.preCommandBuffer[i]) {
          for (let j = 0; j < this.preCommandBuffer[i].length; j++) {
            if (
              currentLine[j] !== this.preCommandBuffer[i][j] &&
              currentLine.substring(j).trimRight()
            ) {
              command += currentLine.substring(j).trimRight() + "\n";
              break;
            }
          }
        } else if (currentLine.trimRight()) {
          command += currentLine.trimRight() + "\n";
        }
      }
    }

    return command;
  };

  private savePreviousState = () => {
    this.preCommandBuffer = [];
    for (let i = 0; i < this.term!.buffer.length; i++) {
      this.preCommandBuffer.push(this.term!.buffer.getLine(i)?.translateToString() || "");
    }
  };
}
