## Requirements

Raspberry Pi
* SD card with Raspbian operating system*
* Wifi dongle
* Bluetooth
* Power supply 5V 2.0A

Note: If raspbian OS is not present on SD card, then follow the link “https://www.raspberrypi.org/documentation/installation/installing-images/README.md”.


## Raspberry Pi Bring up
Find model of the board. The steps differ for raspberry pi 2 and a older raspberry pi

* Boot to terminal.
* For Raspberry Pi 2, run the following commands. Note: This also installs some additional dependencies.
```
curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -
sudo apt-get install -y build-essential python-dev python-rpi.gpio nodejs
```
* For Raspberry Pi, the simplest way to install Node.js and other dependencies on Pi (version 1)
```
wget http://node-arm.herokuapp.com/node_latest_armhf.deb
sudo dpkg -i node_latest_armhf.deb
sudo apt-get install build-essential python-dev python-rpi.gpio
```


## Install Red Rotary phone application 
* cd /home/pi/
* wget  https://github.com/IoTBLR/Sherlock/archive/v0.3.zip
* unzip v*.zip
* cd ./Sherlock-*
* sudo bash ./install.sh -i
Note: If prompted for password, then enter password as raspberry.
Sherlock-* is to be replaced with version you download.
For example, if v0.3.zip is downloaded, then directory name will be Sherlock-0.3.

When you install you will prompted to give the ***Game ID***. This is the unique ID for this Raspberry Pi phone. Please store this values as this is required when entering the clues in Cloudant. 

##Instruction Guides

[Cloudant](https://github.com/IoTBLR/Sherlock/blob/master/instructions/Cloudant%20Instructions.doc?raw=true) - Instructions for entering the clues for the game play. 


[Red rotary phone](https://github.com/IoTBLR/Sherlock/blob/master/instructions/Red%20rotary%20phone_prototype%20building.pdf) - Instructions for hacking the Red Rotary phone.
