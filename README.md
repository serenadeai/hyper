# Serenade for Hyper

## Installation

1. Download and install Hyper 3.1.1 from https://github.com/serenadeai/serenade-hyper/releases.
    - This version of Hyper contains a newer version of xterm.js, and it will be released by the Hyper team soon! In the meantime, you can use the above builds.
1. Launch Hyper, then use the menu item Plugins > Update to automatically download the Serenade plugin.
1. Restart Hyper to make sure Serenade is loaded.

### Windows

On Windows, you might want to change Hyper's configuration file to point to your shell with Edit > Preferences. The default configuration file will have examples in the comments above the `shell` entry. For example, to use Git Bash as you shell, you can do:

    shell: 'C:\\Program Files\\Git\\bin\\bash.exe'

## Development

### macOS

1. Clone this repo, and run `ln -s <absolute path to this repository> ~/.hyper_plugins/local/hyper-serenade` to create a symlink.
1. Run `yarn` to get dependencies, then `yarn watch` to build.
1. Change Hyper's configuration with:
    - towards the bottom, `localPlugins`:
       ```
       localPlugins: [
         "hyper-serenade"
       ],
       ```
1. After a rebuild, you should quit Hyper and restart, or do View > Full Reload.
1. Optionally, use `command + option + I` to open Hyper's developer tools, which should show `Plugin serenade-hyper (x.y.z) loaded.` along with any messages from the plugin.
1. Optionally, run `rm -rf ~/.hyper.js ~/.hyper_plugins/` to remove previously installed configuration and plugins.

### Windows

1. Clone this repo to `~\AppData\Roaming\Hyper\.hyper_plugins\local\hyper-serenade`. `AppData` is a hidden folder.
1. Since symlinks may not work on Windows, also clone `https://github.com/serenadeai/editor-shared` and replace the `src/shared` symlink here with the contents of `editor-shared/src`.
1. Run `yarn` to get dependencies, then `yarn watch` to build.`
1. Optionally, run `rm -rf ~/AppData/Roaming/Hyper/` to remove previously installed configuration and plugins.

## Design

### Terminal, tty, shell

A **terminal (emulator)** can be defined as a GUI program, like [Terminal](https://en.wikipedia.org/wiki/Terminal_(macOS)), [iTerm](https://iterm2.com/), or [Hyper](https://hyper.is/), that provides access to input/output with the operating system.

In Unix, that access is accomplished via a **tty**, an interface provided by the operating system as a file (`/dev/tty{s}*` in Linux and macOS, indicated by the `tty` and `who` commands.)

A **shell** is a program, like Bash or Zsh, "whose primary purpose is to start other programs" or enable more advanced scripting via commands, usually indicated by the `echo $SHELL` command.

Source: [What is the exact difference between a 'terminal', a 'shell', a 'tty' and a 'console'?](https://unix.stackexchange.com/questions/4126/what-is-the-exact-difference-between-a-terminal-a-shell-a-tty-and-a-con)

### Implementation

#### Layout

Since Hyper is written in TypeScript and its plugins are in TypeScript as well, this plugin is able to use a [shared package](https://github.com/serenadeai/editor-shared) as its foundation for IPC with the desktop client and dispatching commands.

In `index.ts`, when a new Hyper tab is created, a new instance of the `CommandHandler` class is created, along with the IPC needed. Hyper exposes access to the underlying [xterm.js](https://github.com/xtermjs/xterm.js)'s `Terminal` object, which actually handles inputs and outputs. So whenever a new `Terminal` instance is detected, we attach our `XtermController` to that instance.

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
