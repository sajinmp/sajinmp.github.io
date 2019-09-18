---
layout: post
title: "Running Aliases through Run Applications"
date: 2014-09-11 19:57:00
keywords: 'Aliases, Linux, Run applications, alias on run applications'
---
I upgraded to Debian Jessie from Wheezy 2-3 months back. When I first started using it I was annoyed by the new activities menu which did not have the catagories and the halt and logout which are integrated into the user names and so on (I am speaking of GNOME). But when I started using jessie, it felt alright and now I am comfortable once again in the way I was with wheezy. It was fun upgrading when I had some bugs and was able to tackle them. 

I had chromium, google-chrome and firefox browsers installed in wheezy. When I upgraded they got retained as well. I do not use google-chrome and firefox much. Chromium is my favourite. I use google-chrome only when I have to watch videos online.

Today I tried to open google-chrome using the 'Run applications' dialogue. What I usually do is type 'goo' and click the tab key. It used to get auto filled as google-chrome. But today it stopped at google. When I used the terminal I found that googletalk was also installed which caused the problem. So I created an alias 'google' so that just the text would be enough to open google-chrome. In terminal it succeeded.

I tried it in the Run application box. It displayed the familiar error "Command not found". To rectify that I just ran the following command.

> \# ln -s google-chrome /usr/bin/google

It adds the link 'google' to google-chrome which can be accessed on the Run applications dialogue as well.
