import CommandHandler from "./command-handler";
import IPC from "./shared/ipc";
import { XtermController } from "./xterm-controller";

let xtermController: XtermController;

export const onRendererWindow = (_window: any) => {
  let commandHandler: CommandHandler;
  let ipc: IPC;

  function resetAndConnect() {
    commandHandler = new CommandHandler();
    ipc = new IPC(commandHandler, "hyper");
    commandHandler.setIPC(ipc);

    ipc.start();
  }

  // setInterval(() => {
  //   console.log("editorState source:", xtermController.command());
  //   console.log("editorState selection:", xtermController.selection());
  // }, 2000);

  // resetAndConnect();
};

export const getTermProps = (_uid: any, _parentProps: any, props: any) => {
  // Create a new XtermController if the Terminal instance is new
  if (props.term && (!xtermController || props.term != xtermController.term)) {
    console.log("Adding handler")
    xtermController = new XtermController(props.term);
  }
  return props;
}
