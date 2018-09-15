# If the session is an ssh connection
if [[ $(who am i) =~ \([-a-zA-Z0-9\.]+\)$ ]]
then
    echo "Attaching to scanner"
    screen -x scanner
else
    if ! screen -list | grep -q "scanner"
    then
        # No scanner is running, start it
        echo "Running scanner"
        screen -S scanner bash screen.sh
    else
        # Scanner is running, attach to it
        echo "Attaching to scanner"
        screen -x scanner
    fi
fi
