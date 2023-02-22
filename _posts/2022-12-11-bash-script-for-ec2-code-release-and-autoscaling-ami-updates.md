---
layout: post
title: Bash script for EC2 code release and Autoscaling ami updates
date: 2022-12-11 20:46:12 +0530
---

I was trying out EC2 image builder to setup an automated solution for my releases. We don't have too much concurrent traffic which makes it so that just one instance of EC2 is enugh to serve our needs. From what I understood, Image builder launches new instances every time. Our Ec2 instance in associated to an autoscaling group, which leads me to believe that the instances will be replaced via **Instance refresh**. There is an issue with this in our scenario.

Instance refresh works by first draining and taking down the existing instance before the new one starts up. This causes a downtime. It indeed has options to specify minimum healthy targets required, but in the case where there is only 1 instance, this doesn't work. So I wanted to write a script to automate the entire release process. There are better ways to get this done but I didn't want to spend much time setting it all up, since there are plans to move to ECS on Fargate.

The script can be found [here](https://github.com/sajinmp/rails-capistrano-aws-deployment). Its a bash script which uses *aws-cli* to handle the process. The testing and deployment part is not added here.

> The script contains a bit of code to identify an older ami-image and removing it. I only keep 2 ami-images, so it suits my purpose.

Let me know if there are any corrections to be made.
