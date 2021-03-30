if [[ "$OSTYPE" == "darwin"* || "$OSTYPE" == "linux-gnu"* ]]; then
  srcDir="$HOME/.hyper_plugins/node_modules/serenade-hyper"
elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" ]]; then
  srcDir="$HOME/AppData/Roaming/Hyper/.hyper_plugins/node_modules/serenade-hyper"
fi

if [[ $SHELL == *"bash"* ]]; then
  # In Ubuntu, the default Bash script is .bashrc
  if [ -f "$HOME/.bashrc" ]; then
    echo "Adding ${srcDir}/bin/serenade-shell-integration.bash to ~/.bashrc"
    echo "source ${srcDir}/bin/serenade-shell-integration.bash" >> ~/.bashrc
  else
    echo "Adding ${srcDir}/bin/serenade-shell-integration.bash to ~/.bash_profile"
    echo "source ${srcDir}/bin/serenade-shell-integration.bash" >> ~/.bash_profile
  fi

elif [[ $SHELL == *"zsh"* ]]; then
  echo "Adding ${srcDir}/bin/serenade-shell-integration.zsh to ~/.zshrc"
  echo "source ${srcDir}/bin/serenade-shell-integration.zsh" >> ~/.zshrc
fi
