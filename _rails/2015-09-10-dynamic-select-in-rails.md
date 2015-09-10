---
layout: post
title: 'Dynamic Select in Rails'
date: 2015-09-10 16:45:52
---
Last week I was trying to setup dynamic select boxes in rails. At the begining I tried to use `collection_select` form helper to setup both the select boxes. I was planning to do the filtering using JS. But I was unsuccessful in that. Then while I went through the rails API, I read about `grouped_collection_select` which can filter the data automatically if the relation is defined. So i wanted to use that. 

Lets setup a sample application to do this. 

    $ rails new dynamic_boxes

This will create a new application. Lets setup dynamic select boxes for categories and subcategories. I have to setup an Article model which belongs to a category and subcategory. So we'll have 3 models - Article, Category and Subcategory.

    dynamic_boxes]$ rails g model Category name
    dynamic_boxes]$ rails g model Subcategory name
    dynamic_boxes]$ rails g scaffold Article name content:text category\_id:integer subcategory\_id:integer
    
### app/model/category.rb

    has_many :subcategories
    
### app/model/subcategory.rb

    belongs_to :category

These will create the models and the controller and views for article. Now we go to the articles view `_form.html.erb`

### app/view/articles/_form.html.erb

---
<%= form_for @article do |f| %>

  <%= f.label :name %> 
  <%= f.text_field :name %> 
  
  <%= f.label :content %>
  <%= f.text_area :content %>
  
  <%= f.collection_select(:category\_id, Category.all, :id, :name, { prompt: 'Select a category' }, { id: 'category-select' }) %>
  <%= f.grouped_collection\_select :subcategory\_id, Category.all, :subcategories, :name, :id, :name, { include\_blank: 'Select a sub category' }, { id: 'subcategory-select' } %>
  
  <%= f.submit 'Save' %>
<% end %>
---

Now seed some data. Then in the new articles page we can find that the dropdown of subcategories is filtered by its respective categories. Now we can write some **coffeescript** to filter the subcategory options according to the selected category.

### app/assets/javascripts/articles.js.coffee

---
jQuery ->
  subcat = $('#subcategory-select').html()
  $('#category-select').change ->
    cat = jQuery('#category-select').children('option').filter(':selected').text()
    options = $(subcat).filter("optgroup[label='#{cat}']").html()
    if options
      $('#subcategory-select').html(options)
    else
      $('#subcategory-select').empty()
---

And thats it. Now if you try to select a category, the subcategories will get filtered automatically.


