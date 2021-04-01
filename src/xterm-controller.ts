interface Prompt {
  prefix: string;
  offsetLeft: number;
  bufferIndex: number;
}

export default class XtermController {
  private prompt: Prompt = { prefix: "", offsetLeft: 0, bufferIndex: 0 };
  private terminal: any;
  private updateOnRender: boolean = false;

  private getActiveLine(): string {
    const buffer = this.terminal.buffer.active;
    let i = this.getActiveLineNumber();
    let line = buffer.getLine(i).translateToString().trimRight();
    while (i > 0 && buffer.getLine(i).isWrapped) {
      line = buffer.getLine(i - 1).translateToString() + line;
      i--;
    }

    return line;
  }

  private getActiveLineNumber(): number {
    const buffer = this.terminal.buffer.active;
    for (let i = buffer.length - 1; i >= 0; i--) {
      if (
        buffer.getLine(i).isWrapped ||
        !/^\s*$/.test(buffer.getLine(i).translateToString().trimRight())
      ) {
        return i;
      }
    }

    return 0;
  }

  private updatePrompt() {
    this.prompt = {
      prefix: this.getActiveLine(),
      offsetLeft: this.terminal.buffer.active.cursorX,
      bufferIndex: this.getActiveLineNumber(),
    };
  }

  setTerminal(terminal: any) {
    if (!terminal || this.terminal == terminal) {
      return;
    }

    this.terminal = terminal;

    this.terminal.onRender((data: any) => {
      if ((data.start == 0 && data.end == this.terminal.rows - 1) || this.updateOnRender) {
        this.updatePrompt();
      }
    });

    this.terminal.onKey((_key: any) => {
      this.updateOnRender = false;
    });

    this.terminal.onLineFeed(() => {
      this.updateOnRender = true;
    });

    setTimeout(() => {
      this.updatePrompt();
    }, 200);
  }

  state(): { source: string; cursor: number } {
    return {
      source: this.getActiveLine().substring(this.prompt.offsetLeft),
      cursor:
        this.terminal.cols * (this.getActiveLineNumber() - this.prompt.bufferIndex) +
        this.terminal.buffer.active.cursorX -
        this.prompt.offsetLeft,
    };
  }
}
