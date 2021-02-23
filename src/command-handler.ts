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
    const source = this.xtermController.command();
    const cursor = 0;

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
}

export default CommandHandler;
