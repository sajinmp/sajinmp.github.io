---
layout: post
title: 'Ruby script to automate my blog publishing'
date: 2014-09-12 23:31:47
keywords: 'automating, jekyll, github pages, publishing to github pages'
---
Hi there. I just wrote a ruby script to automate the publishing to my blog. Since the naming of posts is in a certain case, it was giving me a headache to manually type the filename. This made me think of writing a script to automate the filenaming process. Then I thought that if I could name the files then why not do the entire job of publishing in this single script.

So I started on the script and completed the filenaming section first. I read the title from the input provided by the user ( which is me ;) ) and then formated it to suit the filename necessity. Then I created the file and read the content from the user. Finally after writing everything onto the file I commited it using git vcs and pushed it to my github repo along with which my blog will also get updated.

This is the very first script that I am writing to simplify one of myI have right now after completing this particular script proves me that the size of the work doesn't matter. I hope to have Nithin check it out. After all I am using a theme which he created. 

The code can be found on github in [Experiments-in-Ruby](https://github.com/sajinmp/Experiments-in-Ruby). I know the code is not neat and there could be an even easier way. I am curious to hear from anyone who can guide me through the better way. Thats all. Thanks


