import IPC from "./shared/ipc";

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

  setIPC(ipc: IPC) {
    this.ipc = ipc;
  }
}

export default CommandHandler;
