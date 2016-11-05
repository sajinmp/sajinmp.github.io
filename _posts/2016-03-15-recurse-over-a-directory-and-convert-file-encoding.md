---
layout: post
title: 'Recurse over a directory &amp; Convert file encoding'
date: 2016-03-15 16:35:48
keywords: 'linux, ruby, recurse over directory, listing files, convert encoding'
description: "I had to do some task across all files in a directory. The directory had subdirectories which in turn had subdirectories again. Although I know that there was a Dir module in ruby"
---
Yesterday I had to do some task across all files in a directory. The directory had subdirectories which in turn had subdirectories again. Although I know that there was a `Dir` module in ruby, I didn't know that it would have the function necessary. But when I googled I found a method named `glob` in the `Dir` module. So I am just writing this post to show how it works.

    ----
    Dir.glob("/path/to/main/dir/\*\*/\*\*/*.html").each do |s|
      # \*\* is for subdirectory and * is for file
      # It returns an array of path to the files

      s = File.open(s)
      # Do whatever you want

    end
    ----

This is particularly easy but I was wondering how much time I took.

Also there was another problem due to encoding. These files were encoded in **windows-1252**. I used my dear linux to fix it.

    ----
    ]$ find . -type f -name '*.html' -exec iconv -f windows-1252 -t utf-8 "{}" -o "{}" \;
      # This command finds all files with name ending with **html** and runs **iconv** to convert them to utf-8 and replaces the files.
    ----

These are some easy ones. But it actually took me a whole day to find all this. (Well not a whole day :))
