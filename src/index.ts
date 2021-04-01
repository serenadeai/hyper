import CommandHandler from "./command-handler";
import IPC from "./shared/ipc";
import XtermController from "./xterm-controller";

let ipc: IPC;
let commandHandler: CommandHandler;
let xtermController: XtermController = new XtermController();

export const onRendererWindow = (_window: any) => {
  const resetAndConnect = () => {
    commandHandler = new CommandHandler(xtermController);
    ipc = new IPC(commandHandler, "hyper");
    ipc.start();
  };

  resetAndConnect();
};

export const getTermProps = (_uid: any, _parentProps: any, props: any) => {
  xtermController.setTerminal(props.term);
  return props;
};
