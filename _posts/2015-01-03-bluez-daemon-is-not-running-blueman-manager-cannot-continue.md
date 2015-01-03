---
layout: post
title: 'Bluez daemon is not running, blueman-manager cannot continue'
date: 2015-01-03 11:06:46
---
I started up my newly installed Arch. It is a brilliant distro ideal for intermediate users who want to learn more of linux. Since you have to set up from the begining yourself, there is a lot to learn. I was happy with all the tweakings that I could do.

Then came a problem. My bluetooth is not reading any devices. I had installed network manager which used to detect bluetooth devices in my debian. I tried to rectify this problem by installing Blueman. Blueman got installed successfully but I got the following error message.
"Bluez daemon is not running, blueman-manager cannot continue."
Then there was something like either the device did not start or not detected. I searched the web and well I tried all that I found to end in no results. 

Then I started and enabled the bluetooth device using the systemctl command. There it was functioning properly. The commands were

> \# systemctl start bluetooth.service

> \# systemctl enable bluetooth.service
