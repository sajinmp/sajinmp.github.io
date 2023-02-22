---
layout: post
title: Adb device rules for Arch
date: 2023-02-22 06:52:12 +0530
---

I was trying to build an app using react-native on my arch and while setting up a device, it was not working based on the react-native [docs](https://reactnative.dev/docs/running-on-device). Based on the doc, a udev rule is added so that the device identified by vendor belongs to the `plugdev` group.

The problem was that Arch didn't have the `plugdev` group. Once this was figured out, the rest was easy. I had to add 3 rules to udev, so that adb could recognize the device and get authorized as well.

```
SUBSYSTEM=="usb", ATTR{idVendor}=="22b8", MODE="0660", GROUP="adbusers"
SUBSYSTEM=="usb",ATTR{idVendor}=="22b8",ATTR{idProduct}=="2e76",SYMLINK+="android_adb"
SUBSYSTEM=="usb",ATTR{idVendor}=="22b8",ATTR{idProduct}=="2e76",SYMLINK+="android_fastboot"
```

The `idVendor` is the same as mentioned on the doc and the `idProduct` are the last 4 digits.
