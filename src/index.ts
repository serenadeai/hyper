import CommandHandler from "./command-handler";
import IPC from "./shared/ipc";

export const onRendererWindow = (window: any) => {
  let commandHandler: CommandHandler;
  let ipc: IPC;

  function resetAndConnect() {
    commandHandler = new CommandHandler();
    ipc = new IPC(commandHandler, "hyper");
    commandHandler.setIPC(ipc);

    ipc.start();
  }

  // resetAndConnect();
};

export const middleware = () => (next: any) => (action: any) => {
  console.log("middleware:", action);

  next(action);
};

export const reduceUI = (state: any, action: any) => {
  console.log("reduceUI:", state, action);
  return state;
}

export const reduceSessions = (state: any, action: any) => {
  console.log("reduceSessions:", state, action);
  return state;
}

export const reduceTermGroups = (state: any, action: any) => {
  console.log("reduceTermGroups:", state, action);
  return state;
}

export const getTermProps = (uid: any, parentProps: any, props: any) => {
  console.log("getTermProps:", uid, parentProps, props);
  return props;
}

export const mapHyperState = (state: any, map: any) => {
  console.log("mapHyperState:", state, map);
  return map;
}
