---
layout: post
title: 'Integrating Paypal with Active Merchant'
date: 2016-04-13 03:10:23 +0530
keywords: 'rails, activemerchant, paypal, integrating payment gateway, add paypal to rails, paypal in activemerchant'
description: "I did a project where I had to integrate 2 payment systems (Paypal and PayU) in a rails app. I read through gems and APIs for both and it seemed"
---
I did a project where I had to integrate 2 payment systems (Paypal and PayU) in a rails app. I read through gems and APIs for both and it seemed easy. It was later that I heard of **Active Merchant** which has almost all payment gateways available. I searched google on ways to integrate it and there was no tutorial or posts at all which helped me to do this. There was an old rails casts episode which did this but it used `rails 2`. 

I tried to do it my way looking at the Gem doc and it took a bit of time but I finally figured it out. I am going to explain how to integrate **Paypal Express Checkout** to a `rails 4` application.

I am not gonna explain it from scratch. I hope you have a rails app all setup with basic order details. 

So we first add `activemerchant` to gemfile.

> Gemfile
> {% highlight ruby %}
  gem 'activemerchant'
  {% endhighlight %}

Then run `bundle` and install the gem. Now we create an initializer file for the `activemerchant` where we enter the **API creds**.

> config/initializers/activemerchant.rb
> {% highlight ruby %}
  ActiveMerchant::Billing::Base.mode = :test # change to :production for live
  ::GATEWAY = ActiveMerchant::Billing::PaypalExpressGateway.new(
    login: ENV['am_username'],
    password: ENV['am_password'],
    signature: ENV['am_signature']
  )
  {% endhighlight %}

I used `figaro` gem to set the environment variables. I am fetching the details from there. Now I have an orders controller where you order something. On its create, I take him to paypal where he completes his payment. You can change its working however you want but I have a simple orders thing just to show it.

> app/controllers/orders_controller.rb
> {% highlight ruby %}
  def create
    @order = Order.new(order_params)
    if @order.save
      checkout_paypal
    else
      render 'new'
    end
  end

  def success
    @order = Order.find(params[:id])
    @order.paypal_payer_id = params[:PayerID] # Paypal return payerid if success. Save it to db
    @order.save
    # Your success code - here & view
  end

  def error
    @order = Order.find(params[:id])
    @s = GATEWAY.details_for(@order.paypal_token) # To get details of payment
    # @s.params['message'] gives you error
  end

  '
  '
  '
  private
    def checkout_paypal
      paypal_response = ::GATEWAY.setup_purchase(
        (@order.amount * 100).round, # paypal amount is in cents
        ip: request.remote_ip,
        return_url: success_order_url(@order), # return here if payment success
        cancel_return_url: error_order_url(@order) # return here if payment failed
      )
      @order.paypal_token = paypal_response.token # save paypal token to db
      @order.save
      redirect_to ::GATEWAY.redirect_url_for(paypal_response.token) and return  # redirect to paypal for payment
    end
  {% endhighlight %}

Thats all with the setting up of **Paypal Express Checkout** with `activemerchant`. 

The **Paypal Standard Checkout** is the same way. Except that in it, you pass the credit card information from your site to paypal and it posts there. The user stays in your site the entire time. 

**PayU** integration is also similar. Looking through the **Active Merchant** repo's `lib` will give you a better idea.
