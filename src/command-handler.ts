import IPC from "./shared/ipc";
import XtermController from "./xterm-controller";

export default class CommandHandler {
  private xtermController?: XtermController;

  async COMMAND_TYPE_GET_EDITOR_STATE(data: any): Promise<any> {
    let result: any = {
      message: "editorState",
      data: {
        filename: "hyper.sh",
      },
    };

    if (!this.xtermController || data.limited) {
      return result;
    }

    const { source, cursor } = this.xtermController.state();
    result.data.source = source;
    result.data.cursor = cursor;
    return result;
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
