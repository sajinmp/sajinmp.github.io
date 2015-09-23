---
layout: post
title: 'Setup 2Checkout (TwoCheckout) with Rails'
date: 2015-09-23 21:12:40
---
This post explains the steps needed to setup 'TwoCheckout' payment gateway with rails. Its pretty easy since there is a gem made to integrate **twocheckout** into rails. I am writing this post to make it easier for those who want to integrate them. I met with some problems when I tried to integrate it with my rails app.

I am not going to explain all the things. I expect that you know the basics of rails to setup products prices and so on. Its pretty easy to do it in a cart as well. But I am not going to explain it for a cart. I will set it up for a single order.

The app has a **Product, User and an Orders model**. I have used devise to setup the user. The orders model has the user_id, product_id and status. It belongs to both user and product with many to one relation. With these we are going to set up twocheckout. 

First add gem twocheckout to Gemfile and run bundle install.

    # Gemfile
    gem 'twocheckout'
    
Now that twocheckout is installed, the first thing we need to do is to require it in the **environment.rb** in config.

    # config/environment.rb
    
    require File.expand_path('../application', __FILE__)
    TestApp::Application.initialize!
    require 'twocheckout'
    
The products page has a buy button which on click creates an order and redirect it to confirm page.

This makes all the methods available to the entire app. Now the rest have to be done in the confirm payment page. I set it up in the **products controller**. I also defined a route for it in the routes as confirm.

    # config/routes.rb
    ---
    resources :products do
      member do
        get :confirm
      end
    end
    ---
    
Now we setup the controller. 

    # app/controllers/products_controller.rb
    
    def confirm
      @product = Product.find(params[:id])
      @order = @product.orders.find_by(user_id: current_user)
      if @order.status == 'success'
        flash[:notice] = 'Already bought'
        redirect_to @product
      else
        @params = { 'sid' => 1817037,
                    'mode' => '2CO',
                    'merchant_order_id' => @order.id,
                    'li_0_product_id' => @product.id,
                    'li_0_name' => @product.name,
                    'li_0_price' => @product.price,
                  }
        @form = Twocheckout::Checkout.form(@params, 'Checkout')
      end
    end
    
Then in the view we just have to call **html_safe** on the form.

    # app/views/products/confirm.html.erb
    
    <%= @form.html_safe %>
    
In confirm page you will see a Checkout button. If you want to change the style of twocheckout button  you will have to add a class using JS to that element. I am not going to explain that.

Now we have a button that will be redirected to Twocheckout payment page. If you want to setup inline twocheckout payment (twocheckout as an overlay) you will have to copy paste a JS from [here](https://www.2checkout.com/static/checkout/javascript/direct.min.js). You will also have to populate all the fields including **address, card_holder_name and so on** in the `params`.

Next we have to set up a callback page from twocheckout. Lets call that return. We will setup the return page.

    # config/routes.rb
    ---
    match '/return', to: 'products#return', via: 'get'
    resources :products do
      member do
        get :confirm
      end
    end
    ---
    
Next we setup the return in products controller. You have to setup callback url from your twocheckout account.

    # app/controllers/products_controller.rb
    
    def return
      @notification = Twocheckout::ValidateResponse.purchase({
                        :sid => 1817037,   # Test sid
                        :secret => "tango",   # secret word of test
                        :order_number => params['order_number'], 
                        :total => params['total'], 
                        :key => params['key']})
      @order = Order.find(params['merchant_order_id'])
      @product = @order.product
      begin
        if @notification[:code] == 'PASS'
          reset_session
          @order.status = 'success'
          @order.save
          flash[:notice] = 'Successful payment'
          redirect_to @product
        else
          flash[:notice] = 'Payment failed'
          redirect_to @product
        end
      end
    end
    
And that is the end of twocheckout setup.
