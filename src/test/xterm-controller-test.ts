import { assert } from "chai";
import { XtermController } from "../xterm-controller";
import { Terminal } from "./xterm-mocks";

interface TerminalTestCase {
  buffer: string[];
  cursorY: number;
  cursorX: number;
  expectedSource: string;
  expectedCursor: number;
}

const newTerminal: TerminalTestCase = {
  buffer: [
    ">                                \n",
    "                                 \n",
    "                                 \n",
    "                                 \n",
    "                                 \n",
    "                                 \n",
    "                                 \n",
  ],
  cursorY: 0,
  cursorX: 2,
  expectedSource: "",
  expectedCursor: 0,
};

const firstCommand: TerminalTestCase = {
  buffer: [
    "> ls -al                         \n",
    "                                 \n",
    "                                 \n",
    "                                 \n",
    "                                 \n",
    "                                 \n",
    "                                 \n",
  ],
  cursorY: 0,
  cursorX: 8,
  expectedSource: "ls -al\n",
  expectedCursor: 6,
};

const finishedCommand: TerminalTestCase = {
  buffer: [
    "> ls -al                         \n",
    "  a b c                          \n",
    ">                                \n",
    "                                 \n",
    "                                 \n",
    "                                 \n",
    "                                 \n",
  ],
  cursorY: 2,
  cursorX: 2,
  expectedSource: "",
  expectedCursor: 0,
};

const newCommand: TerminalTestCase = {
  buffer: [
    "> ls -al                         \n",
    "  a b c                          \n",
    "> echo TERMINAL                  \n",
    "                                 \n",
    "                                 \n",
    "                                 \n",
    "                                 \n",
  ],
  cursorY: 2,
  cursorX: 15,
  expectedSource: "echo TERMINAL\n",
  expectedCursor: 13,
};

const newCommandFinished: TerminalTestCase = {
  buffer: [
    "> ls -al                         \n",
    "  a b c                          \n",
    "> echo TERMINAL                  \n",
    ">                                \n",
    "                                 \n",
    "                                 \n",
    "                                 \n",
  ],
  cursorY: 3,
  cursorX: 2,
  expectedSource: "",
  expectedCursor: 0,
};

const longCommand: TerminalTestCase = {
  buffer: [
    "> ls -al                         \n",
    "  a b c                          \n",
    "> echo TERMINAL                  \n",
    "> ls /Users/cheng/Library/Applica\n",
    "tions                            \n",
    "                                 \n",
    "                                 \n",
  ],
  cursorY: 4,
  cursorX: 5,
  expectedSource: "ls /Users/cheng/Library/Applica\ntions\n",
  expectedCursor: 37,
};

const longCommandWithCursor: TerminalTestCase = {
  buffer: [
    "> ls -al                         \n",
    "  a b c                          \n",
    "> echo TERMINAL                  \n",
    "> ls /Users/cheng/Library/Applica\n",
    "tions                            \n",
    "                                 \n",
    "                                 \n",
  ],
  cursorY: 3,
  cursorX: 4,
  expectedSource: "ls /Users/cheng/Library/Applica\ntions\n",
  expectedCursor: 2,
};

describe("editor state", function () {
  // Sets blank values
  const term = new Terminal([], 0, 0);
  const xtermController = new XtermController(
    // @ts-ignore
    term
  );

  const updateBuffer = (testCase: TerminalTestCase) => {
    term.updateBuffer(testCase.buffer, testCase.cursorY, testCase.cursorX);
  };

  const assertState = (testCase: TerminalTestCase) => {
    assert.equal(xtermController.state().source, testCase.expectedSource);
    assert.equal(xtermController.state().cursor, testCase.expectedCursor);
  };

  // Send fake hooks about the state of the command/execution output
  const startPrompt = () => {
    term.parser.callback("A");
  };
  const endPrompt = () => {
    term.parser.callback("B");
  };
  const startOutput = () => {
    term.parser.callback("C");
  };
  const endOutput = () => {
    term.parser.callback("D");
  };

  // Start of new prompt
  it("new terminal", function () {
    startPrompt();
    updateBuffer(newTerminal);
    endPrompt();
    assertState(newTerminal);
  });

  // Command before execution
  it("first command", function () {
    updateBuffer(firstCommand);
    assertState(firstCommand);
  });

  // Start of new prompt after execution
  it("finished command", function () {
    startOutput();
    updateBuffer(finishedCommand);
    endOutput();
    startPrompt();
    // The buffer in finishedCommand already includes the next prompt
    endPrompt();
    assertState(finishedCommand);
  });

  // New command after execution
  it("new command", function () {
    updateBuffer(newCommand);
    assertState(newCommand);

    startOutput();
    updateBuffer(newCommandFinished);
    endOutput();

    startPrompt();
    assertState(newCommandFinished);
    endPrompt();
  });

  // Long command
  it("long command", function () {
    updateBuffer(longCommand);
    assertState(longCommand);
  });

  // Moving the cursor
  it("long command with cursor", function () {
    updateBuffer(longCommandWithCursor);
    assertState(longCommandWithCursor);
  });
});
