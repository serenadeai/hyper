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

  undoIndex: number = 0;
  commandStack: any[] = [];
  lastCommandWasUse: boolean = false;

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

  async COMMAND_TYPE_DIFF(data: any, commandType: string = ""): Promise<any> {
    const { source, cursor } = this.xtermController.state();
    // console.log("source", source, "cursor", cursor);

    // Adjust diff to not include a trailing newline
    let text = data.insertDiff;
    if (text.endsWith("\n")) {
      text = text.substring(0, text.length - 1);
    }

    // Adjust cursor
    const isDelete =
      data.deleteEnd !== undefined &&
      data.deleteStart !== undefined &&
      data.deleteEnd - data.deleteStart !== 0;
    const newCursor = isDelete ? data.deleteEnd : data.cursor;
    let deleteCount = isDelete ? data.deleteEnd - data.deleteStart : 0;
    let adjustCursor = newCursor - cursor;

    if (commandType == "undo") {
      // For undo commands, manually calculate the adjustments to the cursor, and deletes or inserts
      deleteCount = data.insertDiff?.length || 0;
      if (isDelete) {
        adjustCursor = data.deleteStart - cursor + deleteCount;
      } else {
        adjustCursor = data.prevCursor - cursor + deleteCount;
      }
      text = data.deleted;
    } else if (commandType == "redo") {
      // No action is needed for redo commands since the original command is passed in again
    } else {
      // Otherwise, append the original command (with additional data about the current state) to the
      // command stack so we can undo it later
      data.prevCursor = cursor;
      if (isDelete) {
        // console.log("deleting", source, data.deleteEnd, data.deleteStart);
        data.deleted = source.substring(data.deleteStart, data.deleteEnd);
      }
      // If it's a use command, push this as the last valid command
      if (this.lastCommandWasUse) {
        // Remember the original command's deleted text
        data.deleted = this.commandStack[this.undoIndex - 1].deleted;
        this.commandStack = this.commandStack.slice(0, this.undoIndex - 1);
        this.undoIndex -= 1;
      } else {
        // Otherwise, ensure it's the last command in the stack
        this.commandStack = this.commandStack.slice(0, this.undoIndex);
      }

      this.commandStack.push(data);
      this.undoIndex += 1;
    }

    // Don't delete anything if it's a use command, since the client will do it for us immediately.
    if (this.lastCommandWasUse) {
      adjustCursor = 0;
      deleteCount = 0;
    }

    // console.log("adjusting cursor to", adjustCursor);
    // console.log("erasing by", deleteCount);
    // console.log("writing diff", text);

    this.lastCommandWasUse = false;
    return Promise.resolve({
      message: "applyDiff",
      data: {
        adjustCursor,
        deleteCount,
        text,
        skipBackspace: true,
      },
    });
  }

  async COMMAND_TYPE_UNDO(_data: any): Promise<any> {
    this.undoIndex -= 1;
    if (this.undoIndex < 0) {
      this.undoIndex = 0;
      return;
    }

    const undo_command = this.commandStack[this.undoIndex];
    return this.COMMAND_TYPE_DIFF(undo_command, "undo");
  }

  async COMMAND_TYPE_REDO(_data: any): Promise<any> {
    this.undoIndex += 1;
    if (this.undoIndex > this.commandStack.length) {
      this.undoIndex = this.commandStack.length;
      return;
    }

    const redo_command = this.commandStack[this.undoIndex - 1];
    return this.COMMAND_TYPE_DIFF(redo_command, "redo");
  }

  async COMMAND_TYPE_USE(_data: any): Promise<any> {
    this.lastCommandWasUse = true;
    return Promise.resolve({
      message: "completed",
    });
  }
}

export default CommandHandler;
