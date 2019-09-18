---
layout: post
title: 'Simple Text Search in Rails'
date: 2015-10-13 17:20:01
keywords: 'rails, text search, search, simple search'
---
I am going to implement a very simple text search. The text is done based on title. It can be easily improved to include other search items as well. For this there are not too many things you need. Its just a search bar and a filter in controller.

I am using an Article model to do the search. In the view


    app/view/articles/index.html.erb
{% highlight ruby %}
<%= form_tag articles_path, method: :get do %>
  <%= text_field_tag 'search', nil, placeholder: 'Search' %>
  <%= submit_tag 'Search' %>
<% end %>
{% endhighlight %}


Add this somewhere in the index. Now we have to tweak the index action in the articles controller so that it searches based on the search text entered. Now in the controller


    app/controllers/articles_controller.rb
{% highlight ruby %}
def index
  @articles = Articles.where(['title LIKE ?', "%#{params[:search]}%"])
end
{% endhighlight %}

This will fetch all articles which have the search text in its title.
