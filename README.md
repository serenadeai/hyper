# Serenade for Hyper

## Code with voice

Serenade is the fastest and easiest way to write code with natural speech. Give your hands a break without missing a beat.

Edit code, run terminal commands, and write documentation entirely with voice. Whether you have an injury or you’re looking to prevent one, Serenade can help you be just as productive without lifting a finger. Use voice alongside your existing workflow, or abandon your keyboard entirely.

Learn more at [https://serenade.ai](https://serenade.ai).

[![Serenade Demo](https://cdn.serenade.ai/img/develop-naturally.gif)](https://serenade.ai/)

## Installation

To use Serenade for Hyper, you'll also need the Serenade app, available for download [here](https://serenade.ai/download). Then, open your Hyper configuration file and add:

    plugins: [
      "hyper-serenade"
    ]

## Getting Started

Check out the [Serenade documentation](https://serenade.ai/docs) to learn how to set up and start using Serenade.

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

## Publishing

1. Update the version number in `package.json`.
1. Run `yarn` and `yarn build`.
1. Run `npm publish`.

