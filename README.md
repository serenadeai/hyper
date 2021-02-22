# Serenade for Hyper

## Development

1. Clone this repo, and run `ln -s <path> ~/.hyper_plugins/local/serenade-hyper` to create a symlink.
1. In the menu bar, use Hyper > Preferences to open the preferences file, and towards the bottom, set:
   ```
   localPlugins: [
     "serenade-hyper"
   ],
   ```
1. Run `yarn` to get dependencies, then `yarn watch` to build.
   
## Installation

1. Download `Hyper-3.1.0-canary.4.dmg` from https://github.com/vercel/hyper/releases/tag/v3.1.0-canary.4 and move Hyper.app to your Applications folder. The newer version is required for Xterm.js 4.*, which has buffer reading support.
1. Add `source .../bin/serenade-shell-integration.{bash,zsh}` to `.{bash,zsh}rc`. This tells your shell to send additional escape codes that indicate the start and end of commands and output. This is based on [iTerm2's shell integration](https://iterm2.com/documentation-shell-integration.html).

## Current limitations

- Any elements on the same line to the right of the prompt will be captured as part of the command.
- Full-screen apps like Vim are not supported.
- SSH is not supported.

## Issues

1. The escape key seems to be captured by Hyper: https://github.com/vercel/hyper/issues/3929. Workaround is to add this to the config:

```
  keymaps: {
    // Example
    // 'window:devtools': 'cmd+alt+o',
    'editor:break': 'esc'
  },
```
