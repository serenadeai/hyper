import IPC from "./shared/ipc";
import XtermController from "./xterm-controller";

export default class CommandHandler {
  private xtermController?: XtermController;

  async COMMAND_TYPE_GET_EDITOR_STATE(data: any): Promise<any> {
    if (!this.xtermController || data.limited) {
      return {
        message: "editorState",
        data: {
          filename: "hyper.sh",
        },
      };
    }

    const { source, cursor } = this.xtermController.state();
    return {
      message: "editorState",
      data: {
        source,
        cursor,
        filename: "hyper.sh",
      },
    };
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
