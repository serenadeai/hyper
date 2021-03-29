if [[ "$OSTYPE" == "darwin"* ]]; then
  srcDir="$HOME/.hyper_plugins/node_modules/serenade-hyper"
elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" ]]; then
  srcDir="$HOME/AppData/Roaming/Hyper/.hyper_plugins/node_modules/serenade-hyper"
fi

if [[ $SHELL == *"bash"* ]]; then
  echo "Adding ${srcDir}/bin/serenade-shell-integration.bash to ~/.bash_profile"
  echo "source ${srcDir}/bin/serenade-shell-integration.bash" >> ~/.bash_profile
elif [[ $SHELL == *"zsh"* ]]; then
  echo "Adding ${srcDir}/bin/serenade-shell-integration.zsh to ~/.zshrc"
  echo "source ${srcDir}/bin/serenade-shell-integration.zsh" >> ~/.zshrc
fi
