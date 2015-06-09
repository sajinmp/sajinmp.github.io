---
layout: post
title: 'Begining android'
date: 2015-06-10 00:02:38
---
I just finished installing all necessary tools for Android development in my Arch. During the process I did many foolish things. I first followed the android instructions in the arch wiki. As a matter of fact, it is completely unnecessary. 

According to the wiki, first I got to install the android-sdk. Then the platform and build tools and finally the android studio. I followed the order and after installing the android studio, when I ran it, the android studio also downloaded the sdk and tools. It was a wastage of data. I know there would be some way to link studio to the existing sdk but I didn't do it. This was easy. 

Then when I created the first application, the build took a lot of time. I thought it got stuck, but FYI it is not stuck. It takes that much time for the first build. So dont kill the studio if it takes time.

Finally after creating the application, I got an error which says 'the class could not be instantiated'. It was due to the Android version that I used for preview. It will show that error for Android API 22 - 5.1.1 Lollipop. When you change it to 21 the error will be corrected. If you change it to 22 again, then there will be no error. I wonder why.

Anyhow I started with android. Lets see what I'll cook up. :D


