interface Prompt {
  prefix: string;
  offsetLeft: number;
  offsetTop: number;
}

export default class XtermController {
  private prompt: Prompt = { prefix: "", offsetLeft: 0, offsetTop: 0 };
  private searching: boolean = false;
  private terminal: any;
  private uid: string;
  private updateOnRender: boolean = false;

  screenWasCleared: boolean = false;

  constructor(terminal: any, uid: string) {
    this.terminal = terminal;
    this.uid = uid;

    this.terminal.onRender((data: any) => {
      // when the screen is cleared, then we only want to update the buffer index, since
      // there might be text in the prompt already
      if (this.screenWasCleared) {
        this.prompt.offsetTop = this.buffer().viewportY + this.buffer().cursorY;
        this.screenWasCleared = false;
        return;
      }

      const lastNonBlankLine = this.buffer().getLine(this.getLastNonBlankLineIndex());
      const lastLineText = lastNonBlankLine.translateToString();
      this.searching =
        lastLineText.startsWith("(reverse-i-search)") ||
        lastLineText.startsWith("(failed reverse-i-search)") ||
        lastLineText.startsWith("bck-i-search") ||
        lastLineText.startsWith("failing bck-i-search");

      // we update the prompt in the case that a full-screen app was just quit, which renders
      // the entire terminal, or when the update variable is set. creating a multi-line command
      // at the end of the terminal also renders the entire screen, but we don't want to update
      // the prompt in that case, because the buffer index is the same; to detect this case,
      // we can just check if the active line is wrapped.
      if (
        (data.start == 0 && data.end == this.terminal.rows - 1 && !lastNonBlankLine.isWrapped) ||
        this.updateOnRender
      ) {
        this.updatePrompt();
      }
    });

    // when any key is pressed, we want to stop updating the prompt, but clearing the screen
    // is handled separately (see above).
    this.terminal.onKey((key: any) => {
      if (key.domEvent.key == "l" && key.domEvent.ctrlKey) {
        this.screenWasCleared = true;
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

  private buffer() {
    return this.terminal.buffer.active ? this.terminal.buffer.active : this.terminal.buffer;
  }

  private getLastNonBlankLineIndex(): number {
    for (let i = this.buffer().length - 1; i >= 0; i--) {
      if (
        this.buffer().getLine(i).isWrapped ||
        !/^\s*$/.test(this.buffer().getLine(i).translateToString().trimRight())
      ) {
        return i;
      }
    }

    return 0;
  }

  private updatePrompt() {
    const offsetLeft = this.buffer().cursorX;
    const offsetTop = this.buffer().viewportY + this.buffer().cursorY;
    const line = this.buffer().getLine(offsetTop).translateToString();

    this.prompt = {
      prefix: line.substring(0, offsetLeft),
      offsetLeft,
      offsetTop,
    };
  }

  scrollDown() {
    this.terminal.scrollPages(1);
  }

  scrollUp() {
    this.terminal.scrollPages(-1);
  }

  state(): { source: string; cursor: number } {
    const cursorY = this.buffer().viewportY + this.buffer().cursorY;
    let i = this.prompt.offsetTop;
    let source = this.buffer().getLine(i).translateToString().substring(this.prompt.offsetLeft);

    i++;
    while (i < this.buffer().length && this.buffer().getLine(i).isWrapped) {
      source += this.buffer().getLine(i).translateToString();
      i++;
    }

    let cursor =
      this.terminal.cols * (cursorY - this.prompt.offsetTop) +
      this.buffer().cursorX -
      this.prompt.offsetLeft;

    let strippedSource = source.trimRight();
    if (cursor > strippedSource.length) {
      strippedSource += source.substring(strippedSource.length, cursor);
    }

    if (this.searching) {
      strippedSource = "";
      cursor = 0;
    }

    return {
      source: strippedSource,
      cursor,
    };
  }
}
