# Serenade for Hyper

## Installation

### macOS

1. Download `Hyper-3.1.1-serenade.dmg` from https://github.com/serenadeai/serenade-hyper/releases and move `Hyper.app` to your Applications folder.
    - This version is necessary since it includes an updated version of xterm.js.
1. Launch Hyper, and use the menu item Plugins > Update to automatically download the Serenade plugin.
1. From your shell, run `~/.hyper_plugins/node_modules/serenade-hyper/install.sh` to automatically add the shell integration to your shell profile.
    - Alternatively, you can run `cat ~/.hyper_plugins/node_modules/serenade-hyper/install.sh` to see the commands in the script and run them manually.
1. Restart Hyper to load the plugin and shell integration.

### Windows

1. Download and run `Hyper Setup 3.1.1-serenade.exe` from https://github.com/serenadeai/serenade-hyper/releases.
    - This version is necessary since it includes an updated version of xterm.js.
1. Launch Hyper, and use the menu item Plugins > Update to automatically download the Serenade plugin.
1. You will likely need to change Hyper's configuration file to point to your shell with Edit > Preferences. The default configuration file will have examples in the comments above the `shell` entry. For example, Git Bash will require the following:
    ```
    shell: 'C:\\Program Files\\Git\\bin\\bash.exe',
    ```
1. From your shell, run `~/AppData/Roaming/Hyper/.hyper_plugins/local/serenade-hyper/install.sh`.
   - Alternatively, you can run `cat ~/AppData/Roaming/Hyper/.hyper_plugins/local/serenade-hyper/install.sh` to see the commands in the script and run them manually.
1. Restart Hyper to load the plugin and shell integration.

### Linux

1. Download and install `Hyper Setup 3.1.1-serenade.AppImage` from https://github.com/serenadeai/serenade-hyper/releases.
   - This version is necessary since it includes an updated version of xterm.js.
1. Launch Hyper, and use the menu item Plugins > Update to automatically download the Serenade plugin.
1. From your shell, run `~/.hyper_plugins/node_modules/serenade-hyper/install.sh` to automatically add the shell integration to your shell profile.
   - Alternatively, you can run `cat ~/.hyper_plugins/node_modules/serenade-hyper/install.sh` to see the commands in the script and run them manually.
1. Restart Hyper to load the plugin and shell integration.

## Development

### macOS

1. Clone this repo, and run `ln -s <path-to-this-repository> ~/.hyper_plugins/local/serenade-hyper` to create a symlink.
1. In `.{bash,zsh}rc`, change `source ~/serenade-shell-integration.{bash,zsh}` to point to the integration script in the `bin` directory of this repo.
1. Run `yarn` to get dependencies, then `yarn watch` to build.
1. Change Hyper's configuration with:
    - towards the bottom, `localPlugins`:
       ```
       localPlugins: [
         "serenade-hyper"
       ],
       ```
1. After a rebuild, close any existing Hyper windows, use `command + N` to open a new window (which ensures that the new version of this plugin is loaded and initialized)
1. Optionally, use `command + option + I` to open Hyper's developer tools, which should show `Plugin serenade-hyper (0.0.1) loaded.` along with any messages from the plugin.
1. Optionally, run `rm -rf ~/.hyper.js ~/.hyper_plugins/` to remove previously installed configuration and plugins.

### Windows

1. Clone this repo to `~\AppData\Roaming\Hyper\.hyper_plugins\local\serenade-hyper`. `AppData` is a hidden folder.
1. Ensure that `~/.bashrc` has `source ~/AppData/Roaming/Hyper/.hyper_plugins/local/serenade-hyper/bin/serenade-shell-integration.bash`.
1. Since symlinks may not work on Windows, also clone `https://github.com/serenadeai/editor-shared` and replace the `src/shared` symlink here with the contents of `editor-shared/src`.
1. Run `yarn` to get dependencies, then `yarn watch` to build.`
1. Optionally, run `rm -rf ~/AppData/Roaming/Hyper/` to remove previously installed configuration and plugins.

## Design

### Terminal, tty, shell

A **terminal (emulator)** can be defined as a GUI program, like [Terminal](https://en.wikipedia.org/wiki/Terminal_(macOS)), [iTerm](https://iterm2.com/), or [Hyper](https://hyper.is/), that provides access to input/output with the operating system.

In Unix, that access is accomplished via a **tty**, an interface provided by the operating system as a file (`/dev/tty{s}*` in Linux and macOS, indicated by the `tty` and `who` commands.)

A **shell** is a program, like Bash or Zsh, "whose primary purpose is to start other programs" or enable more advanced scripting via commands, usually indicated by the `echo $SHELL` command.

Source: [What is the exact difference between a 'terminal', a 'shell', a 'tty' and a 'console'?](https://unix.stackexchange.com/questions/4126/what-is-the-exact-difference-between-a-terminal-a-shell-a-tty-and-a-con)

### Overview

To enable advanced editing support for terminals, we need to minimally support:
- reading the text of a drafted (an entered, but not yet executed) command, and the position of the cursor relative to the start of that command
- editing or deleting a drafted command
- additional UI controls such as scrolling and controlling panes and tabs

Future feature ideas include:
- using reverse search to better match command alternatives to previously entered commands
- using output from previous commands, such as `ls`, to improve matches for a current command, like `cd`

Unfortunately, a terminal has fairly low-level input/output capabilities. Its buffer is an array of strings representing the current view, and any keystrokes are first sent to the tty before a change is reflected. Hyper, for example, exposes this buffer as well as the events of data being added or changed, though these raw changes do not have sufficient semantics attached, such as whether they are part of a new prompt or the output of some command.

So we need to enlist the help of the shell to determine the state of the terminal. iTerm, for example, has a [shell integration](https://iterm2.com/documentation-escape-codes.html) consisting of a script that instructs the shell to send escape codes through the terminal before and after the prompt, as well as before and after a command is executed.

With these tools and ideas, we can read and write data to the terminal with reasonable confidence.

### Implementation

#### Shell integration

In the `bin` directory, shell scripts based on [iTerm2's shell integration](https://iterm2.com/documentation-shell-integration.html) tells the shell to send additional escape codes that indicate the start and end of the prompt and output:

```
- A: Start of prompt
- B: End of prompt (start of command)
- C: End of command (start of output)
- D: End of output

    [A]prompt% [B] ls -l
    [C]
    -rw-r--r-- 1 user group 127 May 1 2016 filename
    [D]
```

#### Layout

Since Hyper is written in TypeScript and its plugins are in TypeScript as well, this plugin is able to use a [shared package](https://github.com/serenadeai/editor-shared) as its foundation for IPC with the desktop client and dispatching commands.

In `index.ts`, when a new Hyper window is launched, a new instance of the `CommandHandler` class is created, along with the IPC needed. Hyper exposes access to the underlying [xterm.js](https://github.com/xtermjs/xterm.js)'s `Terminal` object, which actually handles inputs and outputs. So whenever a new `Terminal` instance is detected, we attach our `XtermController` to that instance.

##### CommandHandler

`CommandHandler` currently supports two commands:
- `COMMAND_TYPE_GET_EDITOR_STATE`, which asks `XtermController` for the source (command) and cursor position
- `COMMAND_TYPE_DIFF`, which determines the adjustments to the source and cursor needed, and responds to the client to perform some subset of moving the cursor, deleting a number of characters, and inserting additional characters

##### XtermController

`XtermController` handles determining the current state of a drafted command, i.e. the source text and cursor position. This is accomplished by reading the buffer whenever an escape code from the shell integration is detected (via handlers registered to the `Terminal` object) and producing a diff.

For example, a line might be:
```
> 
```

and later:
```
> ls
```

and finally:
```
> ls -al
```

Since we receive an escape code from the shell only after the prompt is written, we know that the command is `ls` or `ls -al` by comparing the contents of the current line to the pre-command state. Similarly, we can calculate the position of the cursor relative to the command's start, even though the `Terminal` object only provides an `x` and `y` coordinate relative to the entire terminal window.

The "canary" version of Hyper is required for Xterm.js 4.*, which provides support for reading the buffer directly.

There are also some methods for writing data directly, though they seem to cause unintended behavior, so at this point the `CommandHandler` asks the client to send simulated keystrokes instead.

##### Tests

The tests ensure that `XtermController` is able to read a command and cursor state correctly, particularly when a long command wraps to the next line, or when a command is aborted without output.

## Current limitations

- Any text set by the shell onto the same line to the right of the prompt will be captured as part of the current command.
- Multiple lines (as with a `\ `) are not supported. 
- Full-screen apps like Vim are not supported.
- SSH requires the shell integration to be installed on the remote server.

## Other issues

1. The escape key seems to be captured by Hyper: https://github.com/vercel/hyper/issues/3929. A workaround is to add this to the config, which is done automatically by our forked version in https://github.com/serenadeai/serenade-hyper:

```
  keymaps: {
    // Example
    // 'window:devtools': 'cmd+alt+o',
    'editor:break': 'esc'
  },
```

## Supported commands

- Add/change/delete
- Go to
- Undo/redo
