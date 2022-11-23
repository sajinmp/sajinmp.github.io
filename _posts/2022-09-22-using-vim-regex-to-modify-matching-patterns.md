---
layout: post
title: Find and replace file content using Vim's Regex Engine
date: 2022-09-22 16:06:12 +0530
---

I wanted to try out vim's regex for some time since it would probably boost my speed and efficiency. A chance came when I had to replace urls in a markdown to the standard structure. This post is an overall summary of the learnings based on my understanding (Just finished and it seems pretty long :D). Please correct me if I am wrong.

### A bit about Vim's Regex Engine

#### Atom and Pattern

> Vim's `:help regex` has a great, but confusing explanation. It took a long time to make sense of this. Might've been my mistake. This [StackExchange reply](https://vi.stackexchange.com/questions/13159/what-is-an-atom) helped me while I was confused.

An atom can be one of a long list of items. Many atoms match one character in the text. It can be a character or a character class. Parentheses can be used to make a pattern into an atom. Below this definition, it said an atom could be an ordinary atom or as mentioned above pattern in parentheses.

A lot of questions popped up. Why do many atoms match one character? In what text is it? What is character class? What about `^` which doen't match anything? Where and what is ordinary atoms? The only thing I clearly understood was, atoms match to a character and pattern are also atoms. But somehow, I thought that ordinary atoms were another component that forms atoms. The stackexchange reply mentioned above helped with understanding the rest of the questions. But a lot of time was spent searching for ordinary atoms before I finally got it.

Atom is the component at the root. For certain characters `*`, `^` there are no matches. They check for its possibility and describe the pattern's behavior. Every atom with a match can be considered a pattern.

#### Vim's Magic Modes

Vim has 4 modes each with differences in how characters function. Each mode is activated by the use of an escaped alphabet pattern (eg: `\m`), corresponding to it. Using this will cause the pattern after it to be interpreted in the corresponding mode.

1. Magic - Activated with `\m`. Magic is the default mode. There are certain characters, which in usual regex, would have literal matches, they don't in this mode. This was confusing, annoying and took some time to get used to. 
    
2. Very magic - Activated with `\v`. This mode is the nearest to the usual style of regex. Only the following characters `a-z, A-Z, 0-9 and _` would have literal matches.

   |    Mode    |   Atom    |   Character    |      Behavior      |
   |:----------:|:---------:|:--------------:|:------------------:|
   |            |     +     |       +        |       \\+          |
   |   magic    |     a     |       a        |       \\a          |
   |            |     *     |     \\*        |         *          |
   |---
   |            |     +     |     \\+        |         +          |
   | very magic |     a     |       a        |       \\a          |
   |            |     *     |     \\*        |         *          |
   {: class="table table-dark table-bordered h6"}

Not sure if its a good terminology.
&nbsp;

### Onto modifying the file

> Complete list - [**Awesome Computer History**](https://github.com/watson/awesome-computer-history)

The file below is a sample of how the structure is.

```md

# Awesome computer history

### Videos

* A Computer Animated Hand - https://www.youtube.com/watch?v=Jjbax5HYHLQ
    * From 1972
    * One of the earliest examples of computer animation
* Hackers - https://archive.org/details/nc101_hackers
    * Looks at the hacker culture and their influence on the early growth of the internet

```

The lines with the url have to be changed to `* [Text](Link)`. There are around 40 to 50 of these lines in the file and could contain numbers as well. Lets write the regex in magic and very magic modes. Both solutions are almost identical with the main difference being the one in magic would need more escapes.

        * Capture `* ` since its needed
            
            Magic      =>   \(*\s\)
            Very magic =>   \v(*\s)

        * Next is an alphanumeric with atleast 1 repetition and a space follows if the alphanumeric is more than 1.

            Magic      =>   \(*\s\)\w\+\s*
            Very magic =>   \v(*\s)\w+\s*

        * The previous match could repeat random number of times and would stop at ` -`

            Magic      =>   \(*\s\)\(\w\+\s*\)\+\s\-
            Very magic =>   \v(*\s)(\w+\s*)+\s-

        * Capture the word or phrase to use it as text for the url

            Magic      =>   \(*\s\)\(\(\w\+\s*\)\+\)\s\-
            Very magic =>   \v(*\s)((\w+\s*)+)\s-

        * Match the space and capture to the end of line. Check for `http` urls as well.

            Magic      =>   \(*\s\)\(\(\w\+\s*\)\+\)\s\-\s\(https\?.*\)$
            Very magic =>   \v(*\s)((\w+\s*)+)\s-\s(https?.*)$

        * Just in case strip off the space before line end

            Magic      =>   \(*\s\)\(\(\w\+\s*\)\+\)\s\-\s\(https\?.*\)\s*$
            Very magic =>   \v(*\s)((\w+\s*)+)\s-\s(https?.*)\s*$

        * Now that the regex is ready, get the modification ready

            Magic      =>   \1\[\2\]\(\4\)
            Very magic =>   \1[\2](\4)

        * Execute the substitute command and finish up. Either regex can be used.

            :%s/\v(*\s)((\w+\s*)+)\s-\s(https?.*)\s*$/\1[\2](\4)/g

&nbsp;

And voila. This is the modified file.

```md

# Awesome computer history

### Videos

* [A Computer Animated Hand](https://www.youtube.com/watch?v=Jjbax5HYHLQ)
    * From 1972
    * One of the earliest examples of computer animation
* [Hackers](https://archive.org/details/nc101_hackers)
    * Looks at the hacker culture and their influence on the early growth of the internet

```

Haven't gone much in-depth in this post. There is another post which I started first, thats around 80% done. Its pretty detailed and I think it would be good for those new or haven't used much regex. 

Please do let me know of any mistakes and also any improvements or corrections to be made.

Almost 2 days on my machine. Its been forever. Too tired. Have a great one!
