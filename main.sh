#! /bin/bash

EXIT=1

function clean_up {
	EXIT=0
	echo "Starting clean up process"
}

trap clean_up SIGHUP SIGINT SIGTERM

which node 
[ $? -ne 0 ] && echo "node is not installed"

while [ ${EXIT} -eq 1 ]
do
	nohup node /opt/RRP/main.js > /dev/null 2>&1 
	sleep 5
done
