---
layout: post
title: 'Permanently Show or Hide Hidden Files'
date: 2014-07-27 22:40:00
keywords: 'show, hide, gnome, linux, hidden files, show or hide files'
description: "After the upgrade, all the hidden files were shown by default. I didn't know how to correct it. I searched the web and almost all the sites said click on"
---

I just upgraded from Debian 7 - Wheezy to Jessie which is right now the Testing. Jessie uses GNOME 3.12. It has good graphics but truly speaking, I like 3.4 better - the one from wheezy. 

After the upgrade, all the hidden files were shown by default. I didn't know how to correct it. I searched the web and almost all the sites said click on Edit->Preferences. The thing is that there is no menu bar in Nautilus. I searched and searched and I finally got an answer. Ubuntu forums gave me an answer. 

You have to go to the dconf-editor. Just run the command 

> :~$ dconf-editor

and in the window which gets opened navigate to org->gtk->settings->file-chooser and check or uncheck the show-hidden option as per your need. Now exit and the task is done.

I didn't like 3.12 so much. I plan to install KDE or XFCE.
