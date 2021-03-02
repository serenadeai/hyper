import CommandHandler from "./command-handler";
import IPC from "./shared/ipc";
import { XtermController } from "./xterm-controller";

let xtermController = new XtermController();

export const onRendererWindow = (_window: any) => {
  let commandHandler: CommandHandler;
  let ipc: IPC;

  function resetAndConnect() {
    commandHandler = new CommandHandler(xtermController);
    ipc = new IPC(commandHandler, "hyper");
    commandHandler.setIPC(ipc);

    ipc.start();
  }

  setInterval(() => {
    console.log("editorState:", xtermController.state());
  }, 2000);

  resetAndConnect();
};

export const getTermProps = (_uid: any, _parentProps: any, props: any) => {
  // Update XtermController if the Terminal instance is new
  if (props.term && props.term != xtermController.term) {
    console.log("Updating Terminal in xtermController");
    xtermController.updateTerm(props.term);
  }
  return props;
};
