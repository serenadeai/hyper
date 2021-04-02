interface Prompt {
  prefix: string;
  offsetLeft: number;
  bufferIndex: number;
}

export default class XtermController {
  private clearScreenPressed: boolean = false;
  private prompt: Prompt = { prefix: "", offsetLeft: 0, bufferIndex: 0 };
  private terminal: any;
  private updateOnRender: boolean = false;

  private buffer() {
    return this.terminal.buffer.active ? this.terminal.buffer.active : this.terminal.buffer;
  }

  private getActiveLine(): string {
    // to get the contents of the active line, we need to merge all wrapped lines upwards
    const buffer = this.buffer();
    let i = this.getActiveLineNumber();
    let line = buffer.getLine(i).translateToString().trimRight();
    while (i > 0 && buffer.getLine(i).isWrapped) {
      line = buffer.getLine(i - 1).translateToString() + line;
      i--;
    }

    return line;
  }

  private getActiveLineNumber(): number {
    // the active line is the bottom-most line that is either wrapped or not entirely whitespace
    const buffer = this.buffer();
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
    // keep track of the absolute horizontal and vertical offsets of the cursor, so we can
    // separate the command being entered from the shell prompt.
    this.prompt = {
      prefix: this.getActiveLine(),
      offsetLeft: this.buffer().cursorX,
      bufferIndex: this.getActiveLineNumber(),
    };
  }

  scrollDown() {
    this.terminal.scrollPages(1);
  }

  scrollUp() {
    this.terminal.scrollPages(-1);
  }

  setTerminal(terminal: any) {
    if (!terminal || this.terminal == terminal) {
      return;
    }

    this.terminal = terminal;

    this.terminal.onRender((data: any) => {
      // when the screen is cleared, then we only want to update the buffer index, since
      // there might be text in the prompt already
      if (this.clearScreenPressed) {
        this.prompt.bufferIndex = this.getActiveLineNumber();
        this.clearScreenPressed = false;
        return;
      }

      // we update the prompt in the case that a full-screen app was just quit, which renders
      // the entire terminal, or when the update variable is set. creating a multi-line command
      // at the end of the terminal also renders the entire screen, but we don't want to update
      // the prompt in that case, because the buffer index is the same; to detect this case,
      // we can just check if the active line is wrapped.
      if (
        (data.start == 0 &&
          data.end == this.terminal.rows - 1 &&
          !this.buffer().getLine(this.getActiveLineNumber()).isWrapped) ||
        this.updateOnRender
      ) {
        this.updatePrompt();
      }
    });

    // when any key is pressed, we want to stop updating the prompt, but clearing the screen
    // is handled separately (see above).
    this.terminal.onKey((key: any) => {
      if (key.domEvent.key == "l" && key.domEvent.ctrlKey) {
        this.clearScreenPressed = true;
        return;
      } else {
        this.updateOnRender = false;
      }
    });

    // when a line feed is received, update the active prompt on the next render call
    this.terminal.onLineFeed(() => {
      this.updateOnRender = true;
    });

    setTimeout(() => {
      this.updatePrompt();
    }, 200);
  }

  state(): { source: string; cursor: number } {
    console.log(
      this.getActiveLineNumber(),
      this.prompt.bufferIndex,
      this.buffer().cursorX,
      this.prompt.offsetLeft
    );

    return {
      source: this.getActiveLine().substring(this.prompt.offsetLeft),
      cursor:
        this.terminal.cols * (this.getActiveLineNumber() - this.prompt.bufferIndex) +
        this.buffer().cursorX -
        this.prompt.offsetLeft,
    };
  }
}
