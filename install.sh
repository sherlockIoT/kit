#! /bin/sh

#functions

#prints error details and exits with error code 1.
error_exit(){
	echo "$1"
	exit 1
}

#installs all dependent packages for rrp project in /opt/RRP directory
#dependency will be taken from package.json present in /opt/RRP directory
install_node_modules(){
    trap '' 1 2 3 15
    npm install
    trap 1 2 3 15
}

#get game id input from user, format to json and write to file.
get_game_id(){
    echo "Enter Game ID :  "
    read GAME_ID
    echo ""
    echo "Entered game ID is "${GAME_ID}""
    echo ""
    echo '{"gameid":"'${GAME_ID}'"}' > gameid.json
}


#install application
install_rrp(){
    trap '' 1 2 3 15
    mkdir -p /opt/RRP/

    cp -rf ./* /opt/RRP/ 

    cd /opt/RRP/

    get_game_id

    install_node_modules

    chmod 0777 /opt/RRP/rrpd 
    [ $? -ne 0 ] && error_exit "error: rrpd file permission was not successful"

    cp -f /opt/RRP/rrpd /etc/init.d/
    [ $? -ne 0 ] && error_exit "error: rrpd copy failed"

    update-rc.d rrpd defaults

    service rrpd start
    trap 1 2 3 15

    exit 0
}

remove_rrp(){
    trap '' 1 2 3 15
    service rrpd stop > /dev/null 2>&1
    update-rc.d -f rrpd remove > /dev/null 2>&1
    rm -rf /etc/init.d/rrpd
    rm -rf /opt/RRP/
    echo "uninstall was successful"
    trap 1 2 3 15
    exit 0
}

usage_rrp(){
    echo ""
    echo ""
    echo "bash ./install.sh [options]"
    echo ""
    echo "  [options]"
    echo "  -i          : installs rrp application"
    echo "  -r          : uninstalls rrp application"
    echo "  -h          : usage of command / current output"
    echo "  --install   : installs rrp application"
    echo "  --remove    : uninstalls rrp application"
    echo "  --help      : usage of command / current output"
}


check_root_user(){
    if [[ $EUID -ne 0 ]]; then
        echo "This script must be run as root" 1>&2
        exit 1
    fi
}

clean_up(){
    echo "signal caught."
    exit 2
}

#start command execution
trap clean_up SIGHUP SIGINT SIGTERM SIGQUIT

case $1 in
    -i|--install)
        check_root_user
        install_rrp
        ;;
    -r|--remove)
        check_root_user
        remove_rrp
        ;;
    -h|--help)
        usage_rrp
        ;;
    *)
        echo "Invalid option, try again."
        usage_rrp
        ;;
esac


#end of execution
