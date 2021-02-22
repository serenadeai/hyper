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
   
## Install

1. Download `Hyper-3.1.0-canary.4.dmg` from https://github.com/vercel/hyper/releases/tag/v3.1.0-canary.4 and move Hyper.app to your Applications folder.
1. Follow `https://iterm2.com/documentation-shell-integration.html` to install iTerm2's shell integration. This tells your shell to send additional escape codes that indicate the start and end of commands and output.

## Limitations

- Any elements on the same line to the right of the prompt will be captured as part of the command.
- Full-screen apps like Vim are not supported.
- SSH is not supported.
