import IPC from "./shared/ipc";
import XtermController from "./xterm-controller";

export default class CommandHandler {
  private xtermController?: XtermController;

  async COMMAND_TYPE_GET_EDITOR_STATE(_data: any): Promise<any> {
    if (!this.xtermController) {
      return;
    }

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

  async COMMAND_TYPE_SCROLL(data: any): Promise<any> {
    if (!this.xtermController) {
      return;
    }

    if (data.direction == "down") {
      this.xtermController.scrollDown();
    } else {
      this.xtermController.scrollUp();
    }
  }

  setXtermController(xtermController: XtermController) {
    this.xtermController = xtermController;
  }
}
