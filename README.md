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
