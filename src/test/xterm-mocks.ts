export class BufferLine {
  constructor(private line: string) {}

  translateToString(): string {
    return this.line;
  }
}

export class Buffer {
  constructor(
    private buffer: BufferLine[],
    public readonly cursorY: number,
    public readonly cursorX: number
  ) {}

  public readonly length = this.buffer.length;

  getLine(y: number): BufferLine | undefined {
    return y < this.buffer.length ? this.buffer[y] : undefined;
  }
}

export class Terminal {
  // @ts-ignore
  private buffer: Buffer;
  constructor(private lines: string[], cursorY: number, cursorX: number) {
    this.updateBuffer(lines, cursorY, cursorX);
  }

  updateBuffer(lines: string[], cursorY: number, cursorX: number) {
    const bufferLines = lines.map((line) => new BufferLine(line));

    this.buffer = new Buffer(bufferLines, cursorY, cursorX);
  }

  public parser = {
    callback: (_data: string) => {},

    registerOscHandler(_code: number, callback: (data: string) => {}) {
      this.callback = callback;
    },
  };
}
