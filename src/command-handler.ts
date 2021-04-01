import IPC from "./shared/ipc";
import XtermController from "./xterm-controller";

export default class CommandHandler {
  constructor(private xtermController: XtermController) {}

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
}
