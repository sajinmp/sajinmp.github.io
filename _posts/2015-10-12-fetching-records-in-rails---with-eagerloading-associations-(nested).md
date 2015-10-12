---
layout: post
title: 'Fetching Records in Rails - With Eagerloading Associations (Nested)'
date: 2015-10-12 16:41:04
---
Earlier today I had to fetch records after eagerloading associations. Mine was a triple nested resource. I went through the rails guides and apis but couldn't find anything other than eagerloading them. I couldn't find any way to give them conditions. After lots of trials and errors I got an answer.

Suppose I have a category model which is associated to a forum model via has-many and the forum model is associated to thread model via has-many. So i can give conditions on thread model like below

    Category.select(:name).includes(forums: [:threads]).where(threads: {title: 'title'})
    
It was so simple but I had no idea.

Another one is to get newest data based on columns.

    Thread.group(:forum_id, :user_id)  # Will give you the latest distict data based on all [user, forum] group.
    
Fetch lowest item with respect to highest.

    Thread.where(forum_id: (Forum.select(:id).where(category_id: 22)), title: 'title') # Fetches all threads of category 22 and has title - 'title'
    
These are awesome ways to do this. I got rid of lots of `each` loops thanks to this.
