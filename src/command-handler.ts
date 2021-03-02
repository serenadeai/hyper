import IPC from "./shared/ipc";
import { XtermController } from "./xterm-controller";

/*
 * The CommandHandler class is a wrapper around other handlers
 * for each category of commands.
 *
 * This needs to be composed with "mixins" since TypeScript currently
 * only allows extending one class.
 */

export class CommandHandler {
  // We can use the extension's IPC to send messages back to the client if needed
  ipc?: IPC;

  constructor(private xtermController: XtermController) {}

  setIPC(ipc: IPC) {
    this.ipc = ipc;
  }

  async COMMAND_TYPE_GET_EDITOR_STATE(_data: any): Promise<any> {
    const { source, cursor } = this.xtermController.state();

    return Promise.resolve({
      message: "editorState",
      data: {
        source,
        cursor,
        filename: "hyper.sh",
        files: [],
        roots: [],
      },
    });
  }

  async COMMAND_TYPE_DIFF(data: any): Promise<any> {
    // Adjust cursor
    const cursor =
      (data.deleteEnd !== undefined &&
        data.deleteStart !== undefined &&
        data.deleteEnd - data.deleteStart !== 0) ||
      (data.insertDiff !== undefined && data.insertDiff !== "")
        ? data.deleteEnd
        : data.cursor;
    console.log("cursor", cursor);
    this.xtermController.adjustCursor(cursor);

    // Send backspaces once the cursor is adjusted
    console.log("erase", data.deleteEnd - data.deleteStart);
    this.xtermController.erase(data.deleteEnd - data.deleteStart);

    // Send actual diff
    console.log("diff", data.insertDiff);
    this.xtermController.write(data.insertDiff.trimRight());

    return Promise.resolve({
      // message: "applyDiff",
      // data: {
      //   adjustCursor: 0,
      //   deleteCount: 0,
      //   text: data.insertDiff.trimRight(),
      // },
    });
  }
}

export default CommandHandler;
