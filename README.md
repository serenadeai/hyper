# Serenade for Hyper

## Installation

1. Download and install Hyper 3.1.1 from https://github.com/serenadeai/serenade-hyper/releases.
    - This version of Hyper contains a newer version of xterm.js, and it will be released by the Hyper team soon! In the meantime, you can use the above builds.
1. Launch Hyper, then use the menu item Plugins > Update to automatically download the Serenade plugin.
1. Restart Hyper to make sure Serenade is loaded.

## Development

### macOS

1. Clone this repo, and run `ln -s <path-to-this-repository> ~/.hyper_plugins/local/hyper-serenade` to create a symlink.
1. Run `yarn` to get dependencies, then `yarn watch` to build.
1. Change Hyper's configuration with:
    - towards the bottom, `localPlugins`:
       ```
       localPlugins: [
         "hyper-serenade"
       ],
       ```
1. After a rebuild, close any existing Hyper windows, use `command + N` to open a new window (which ensures that the new version of this plugin is loaded and initialized)
1. Optionally, use `command + option + I` to open Hyper's developer tools, which should show `Plugin serenade-hyper (x.y.z) loaded.` along with any messages from the plugin.
1. Optionally, run `rm -rf ~/.hyper.js ~/.hyper_plugins/` to remove previously installed configuration and plugins.

### Windows

1. Clone this repo to `~\AppData\Roaming\Hyper\.hyper_plugins\local\serenade-hyper`. `AppData` is a hidden folder.
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

#### Layout

Since Hyper is written in TypeScript and its plugins are in TypeScript as well, this plugin is able to use a [shared package](https://github.com/serenadeai/editor-shared) as its foundation for IPC with the desktop client and dispatching commands.

In `index.ts`, when a new Hyper window is launched, a new instance of the `CommandHandler` class is created, along with the IPC needed. Hyper exposes access to the underlying [xterm.js](https://github.com/xtermjs/xterm.js)'s `Terminal` object, which actually handles inputs and outputs. So whenever a new `Terminal` instance is detected, we attach our `XtermController` to that instance.

##### CommandHandler

`CommandHandler` currently supports:
- `COMMAND_TYPE_GET_EDITOR_STATE`, which asks `XtermController` for the source (command) and cursor position

## Other issues

1. The escape key seems to be captured by Hyper: https://github.com/vercel/hyper/issues/3929. A workaround is to add this to the config, which is done automatically by our forked version in https://github.com/serenadeai/serenade-hyper:

```
  keymaps: {
    // Example
    // 'window:devtools': 'cmd+alt+o',
    'editor:break': 'esc'
  },
```
