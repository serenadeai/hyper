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
    // Adjust diff to not include a trailing newline
    let text = data.insertDiff;
    if (text.endsWith("\n")) {
      text = text.substring(0, text.length - 1);
    }

    // Adjust cursor
    const newCursor =
      (data.deleteEnd !== undefined &&
        data.deleteStart !== undefined &&
        data.deleteEnd - data.deleteStart !== 0) ||
      (data.insertDiff !== undefined && data.insertDiff !== "")
        ? data.deleteEnd
        : data.cursor;

    // Adjust cursor
    // console.log("setting cursor to", cursor);
    // this.xtermController.adjustCursor(cursor);

    // Send backspaces once the cursor is adjusted
    // console.log("erasing by", data.deleteEnd - data.deleteStart);
    // this.xtermController.erase(data.deleteEnd - data.deleteStart);

    // Send actual diff
    // console.log("writing diff", text);
    // this.xtermController.write(text);

    const { source, cursor } = this.xtermController.state();
    console.log("source", source, "cursor", cursor);
    const adjustCursor = newCursor - cursor;
    console.log("adjusting cursor to", adjustCursor);
    const deleteCount = data.deleteEnd - data.deleteStart;
    console.log("erasing by", deleteCount);
    console.log("writing diff", text);
    return Promise.resolve({
      message: "applyDiff",
      data: {
        adjustCursor,
        deleteCount,
        text,
      },
    });
  }
}

export default CommandHandler;
