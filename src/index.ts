import CommandHandler from "./command-handler";
import IPC from "./shared/ipc";
import XtermController from "./xterm-controller";

let ipc: IPC;
let commandHandler: CommandHandler;
let controllers: { [key: string]: XtermController } = {};

export const getTermProps = (uid: string, _parentProps: any, props: any) => {
  if (!ipc) {
    commandHandler = new CommandHandler();
    ipc = new IPC(commandHandler, "hyper");
    ipc.start();
  }

  if (props.term && controllers[uid] === undefined) {
    controllers[uid] = new XtermController(props.term, uid);
    commandHandler.setXtermController(controllers[uid]);
  }

  return props;
};

export const middleware = (_store: any) => (next: any) => (action: any) => {
  if (action.type == "SESSION_SET_ACTIVE" && action.uid) {
    const controller = controllers[action.uid];
    controller.screenWasCleared = true;
    commandHandler.setXtermController(controller);
    ipc.sendActive();
  }

  next(action);
};
