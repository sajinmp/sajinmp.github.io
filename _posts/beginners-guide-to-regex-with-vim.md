---
layout: post
title: Beginners guide for regex with vim
date: 2022-09-22 16:06:12 +0530
---


We'll be using regex in vim to modify file content to how we want. This is a sample of the file structure. 

> Complete list - [**Awesome Computer History**](https://github.com/watson/awesome-computer-history)

```md

# Awesome computer history

### Videos

* A Computer Animated Hand - https://www.youtube.com/watch?v=Jjbax5HYHLQ
    * From 1972
    * One of the earliest examples of computer animation
* Hackers - https://archive.org/details/nc101_hackers
    * Looks at the hacker culture and their influence on the early growth of the internet

```

The lines with the url have to be changed to `* [Text](Link)`. There are around 40 to 50 of these lines in the file. Lets see the solution first
&nbsp;  
&nbsp;  

### A bit about vim's regex engine

Vim has 4 modes each with differences in how characters function. Each mode is activated by the use of `\alphabet` pattern corresponding to it. Using this will cause the pattern after it to be interpreted in the corresponding mode.

1. Magic - Activated with `\m`. Magic is the default mode. Some characters in this mode are treated normally while some have a special meaning. These can be confusing and annoying until a point of familiarity. See an example
    
2. Very magic - Activated with `\v`. This mode has the most compatibility with perl and the usual style of regex would mostly work. Every character other than `a-z, A-Z, 0-9 and underscore (_)` to behave as meaningful characters.

   |    Mode    | Character | Normal pattern | Meaningful pattern |
   |:----------:|:---------:|:--------------:|:------------------:|
   |            |     +     |       +        |       \\+          |
   |   magic    |     a     |       a        |       \\a          |
   |            |     *     |     \\*        |         *          |
   |---
   |            |     +     |     \\+        |         +          |
   | very magic |     a     |       a        |       \\a          |
   |            |     *     |     \\*        |         *          |
   {: class="table table-dark table-bordered h6"}

&nbsp;

### Onto the solution

We'll write the regex in magic and very magic modes. Both solutions are almost identical than magic needing more `\`. The regex which will modify the file is below.

    # Couple lines from the file

    * A Computer Animated Hand - https://www.youtube.com/watch?v=Jjbax5HYHLQ
        * From 1972

    Magic => \(\*\s\)\(\(\w\+\s*\)\+\)\s\-\s\(https\?.*\)\s*$

    Very Magic => \v(*\s)((\w+\s*)+)\s-\s(https?.*)\s*$

**Matching `*`**

Lets break it down first. The first character that has to be matched is '*'. The pattern to match '*' is present in the table above. Lets work on both modes at the same time.

    # `\*` has to be used for normal match in both cases

    Magic => \*

    Very magic => \*

**Matching upto first word**

Next is a whitespace. We can either use a space ` ` the `\s` which is used to match with whitespace characters. Both the initial characters could've been worked on together since the file structure is consistant. But if there were more spaces or none at all, it would be better to think that as well.

    # Since in the solution, its `\s`. We'll use the same

    Magic => \*\s   # `\* ` is the same

    Very magic => \*\s

> In case of an unknown number of spaces we can use `\*\s*` or `\*\s+` based on the minimum number of spaces.

**Matching upto the second word

As for the next part, its random number of characters with a space. There was acase where the characters were numbers as well. Lets handle the first set of characters and then a space.

First, handle the alphabets. Range is a shorter method to specify consecutive characters. `abcd` is the same as `a-d`. If its inside `[]`, like `[a-d]`, then it is `a` or `b` or `c` or `d`. As

    # For the characters and digits, lets use a range.

    Magic => \*\s   # `\* ` is the same

    Very magic => \*\s


> There is an exception in the case of `*`. If `*` is at the beginning of the pattern or right after `^`, that is, `^*`, then it matches the normal symbol. In the other cases, using `*` matches the pattern right before it 0 or more times. Vim calls it a **multi** while other names seems to be **qualifier** or **quantifier**.
>
> The caret symbol, `^`, represents the start of a line if it is the first character. So `^*` will match only if the first character in a line is `*`. It is also used to negate ranges. `[^a-z]` means it'll match all characters except the lowercase `a-z`. In other cases, `^` will match the character itself, that is, `a^` will only be an exact match. Didn't see the last part mentioned anywhere though.
>
> Vim `:help` is being really helpful.

#### The actual process I went through

Started tinkering on [regex101](https://regex101.com) to get a regex ready and had one ready after sometime to match the first half, till the dash. 

    \*\s([a-zA-Z0-9\s]+)\s-     # Failed in vim

Then opened the file in vim and tried this one out and no pattern was found. Started trying out stuff by referring [this url](https://learnbyexample.gitbooks.io/vim-reference/content/Regular_Expressions.html). It took time to get a working regex for the first half. Couldn't figure out any way to print or visual select the matched pattern, but found that executing `:v/regex/d` would delete all the lines which doesn't have a match or you could just execute a substitute and undo it.

    # A working regex to get match from `*` to `-`
    \(\*\s\)\(\(\w\+\s*\)\+\)\s\-

    # Delete all lines without a match (pressing `u` will undo the last operation)
    :v/regex/d

    # Substitute and verify the matches (`%s:/regex/to_replace/g`)
    # % is to look through the entire file, s is substitute.
    :%s/regex//     # Will delete the matched string
    

Next was the substitute function to move the matched pattern into `[]`. Luckily the docs were pretty clear about being able to use the captured group. Each `\(..\)` is a captured group starting from 1 and can be used in the second side with `\1, \2 etc`. The count starts from left to right and goes inwards. The entire matched value can be used with `\0`.

    # Substitute matched_value with [matched_value]
    # g is to replace multiple matches in one line, c is for replacing only after confirmation
    :%s/regex/replace_me/gc   # Replace with `\1\[\2\]`

The strings got replaced by what we wanted. I wanted to try completing this in a single regex.

> Fun fact/Point to remember
>
> It was around this time that I found **very magic**. Almost felt like breaking my machine and quitting this stuff. It was the exact opposite of fun. A reminder to take a glance before jumping head-first into code.

And so there we have it, the final regex which completes the modification of the file.

    # Final regex
    \(\*\s\)\(\(\w\+\s*\)\+\)\s\-\s\(https\?.*\)\s*$

    # Substitue and verify
    %s/regex/replace_me/g  # Replace with `\1\[\2\]\(\4\)`


The file will now look like this.

```md

# Awesome computer history

### Videos

* [A Computer Animated Hand](https://www.youtube.com/watch?v=Jjbax5HYHLQ)
    * From 1972
    * One of the earliest examples of computer animation
* [Hackers](https://archive.org/details/nc101_hackers)
    * Looks at the hacker culture and their influence on the early growth of the internet

```

Since regex in vim has various differences with Perl, it will be confusing and somewhat frustrating. I've heard a lot that the exec mode can help improve efficiency and speed by a lot. Will have to give it a try


##### Rambling thoughts

> Skippable. These were actually at the beginning. But it was just some random thoughts or talks to myself.

I've been using vim for a few years now but hadn't really used its exec mode much. I usually use it just for simple finds and substitutes. It was pretty comfortable using the command mode so much so that instead of `:wq` (write to file and quit) or `:x` (writes to file only if any change was mode), what I used was `ZZ` which works the same way as `:x`. I wanted to try the exec mode more and got a chance.

There was a markdown file which had to be modified based on a pattern. I usually go for `sed` and `awk` in these situations but wanted to try writing regex in vim command mode. The regex was pretty alright but since it was my first try with vim, it took around 3+ hours for me to finally get how it works.
