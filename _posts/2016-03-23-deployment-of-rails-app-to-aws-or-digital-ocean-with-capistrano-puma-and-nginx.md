---
layout: post
title: 'Deployment of Rails app to AWS or Digital Ocean with Capistrano Puma and Nginx'
date:   2016-03-23 18:38:53 +0530
keywords: 'rails, deployment, aws, digital ocean, capistrano, puma, nginx, rails deployment to aws with capistrano'
description: "I believe you have a running rails application since I am not going to explain it from the absolute begining. I use figaro gem here to manage passwords, secrets"
---
I tried deployment for the first time. Everyone told that it was a difficult thing to do. So I was actually afraid. I read through a tutorial and tried to do it. But there were some problems in the tutorial which I had to fix after trying many things. So I will explain step by step, the things to do while deploying to **aws** or **digital ocean** using **capistrano, puma & nginx**.

I believe you have a running rails application since I am not going to explain it from the absolute begining. I use **figaro** gem here to manage passwords, secrets and so on but you are free to use **secrets.yml** if thats what you are comfortable with. But it will need other tweaks and I am not going to explain it here. 


First we are gonna add few gems to our application.

> Gemfile
> {% highlight ruby %}
  gem 'figaro'
  gem 'puma'
  group :development do
    gem 'capistrano'
    gem 'capistrano-rails'
    gem 'capistrano3-puma', require: false # capistrano-puma for older apps
    gem 'capistrano-bundler', require: false
    gem 'capistrano-rvm' 
  end
  {% endhighlight %}

Now bundle the gems by running `bundle install`.

We are now gonna start setting up capistrano. Run the command

    ]$ cap install STAGES=production

This will create few files. We will edit them in the process. First edit the **Capfile** in the root of your application

> Capfile
> {% highlight ruby %}
  require 'capistrano/bundler'
  require 'capistrano/rvm'
  require 'capistrano/rails/assets'
  require 'capistrano/rails/migrations'
  require 'capistrano/puma'
  {% endhighlight %}

Next we edit **deploy.rb** file in the **config** directory.

> config/deploy.rb
> {% highlight ruby %}
  lock '3.4.0'  # Change version as per capistrano
  
  set :application, 'appname' # name of application folder in server
  set :repo_url, 'git@github.com:username/repository_name.git' # link to repository
  set :deploy_to, '/home/deploy/appname' # path to deploy in server
  set :pty, true
  set :linked_files, %w{config/database.yml config/application.yml}  # linking files from shared directory
  set :linked_dirs, %w{log tmp/pids tmp/cache tmp/sockets vendor/bundle public/system public/uploads} # linking folders from shared directory
  set :keep_releases, 3   # default value is 5, Edit as per necessary
  
  set :puma_rackup, -> { File.join(current_path, 'config.ru') }
  set :puma_state, "#{shared_path}/tmp/pids/puma.state"
  set :puma_pid, "#{shared_path}/tmp/pids/puma.pid"
  set :puma_bind, "unix://#{shared_path}/tmp/sockets/puma.sock"    #accept array for multi-bind
  set :puma_conf, "#{shared_path}/puma.rb"
  set :puma_access_log, "#{shared_path}/log/puma_error.log"
  set :puma_error_log, "#{shared_path}/log/puma_access.log"
  set :puma_role, :app
  set :puma_env, fetch(:rack_env, fetch(:rails_env, 'production'))
  set :puma_threads, [0, 8]
  set :puma_workers, 0
  set :puma_worker_timeout, nil
  set :puma_init_active_record, true
  set :puma_preload_app, false
  {% endhighlight %}

I hope that you have not added **database.yml & application.yml** in your git tracking.

## Setting up the server

Now the basic setup is complete. We have to get the server up and running. If you are using AWS select and launch an EC2 instance (I chose Ubuntu 14.04). It will ask you for all kinds of info. You have to generate a key-value pair to connect to EC2 and download the file. You can get the public ip of EC2 instance by clicking on the instance and viewing its details at the bottom.

If you are using **digital ocean** fire up a droplet and you will get the details of the root user in your mail.

We are gonna ssh into the server now.

    ]$ ssh -i path_to_pem_file ubuntu@public_ip # if aws
    ]$ ssh root@ip # if digital ocean

First update the existing packages.

    ]$ sudo apt-get update
    ]$ sudo apt-get upgrade

Next create a user named deploy for deploying the app.

    ]$ sudo useradd -d /home/deploy -m deploy
    ]$ sudo passwd deploy

Now add deploy to sudoers. Run `sudo visudo` and add the following line below `root ALL=(ALL:ALL) ALL`

    deploy ALL=(ALL:ALL) ALL

Now go to user deploy and install git. Then create an ssh key.

    ]$ sudo apt-get install git

Get the public key from your local system (`.ssh/id_rsa.pub`) and add it to the server's **authorized ssh keys** present at `.ssh/authorized_keys`.

Now we are gonna install nginx.

    ]$ sudo apt-get install nginx

Now we are going to edit nginx site-config file

    ]$ sudo vim /etc/nginx/sites-enabled/default

Delete all the existing content and enter the following

> /etc/nginx/sites-available/default
> {% highlight bash %}
  upstream app {
    server unix:/home/deploy/app_name/shared/tmp/sockets/puma.sock fail_timeout=0;
    # no space between unix: and /home
  }
  
  server {
    listen 80;
    server_name localhost;
  
    root /home/deploy/app_name/current/public;
  
    try_files $uri/index.html $uri @app;
  
    location / {
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header Host $host;
      proxy_redirect off;
      proxy_http_version 1.1;
      proxy_set_header Connection '';
      proxy_pass http://app;
    }
  
    location ~ ^/(assets|fonts|system)/|favicon.ico|robots.txt { # add |uploads after system if you want upload directory to server static assets
      gzip_static on;
      expires max;
      add_header Cache-Control public;
    }
  
    error_page 500 502 503 504 /500.html;
    client_max_body_size 4G;
    keepalive_timeout 10;
  }
  {% endhighlight %}

The configuration of nginx is done. Now we go to the rest of the app.

I am using postgresql as the db. So I will use that here as well. We are going to install postgresql.

    ]$ sudo apt-get install postgresql postgresql-contrib libpq-dev

Now we create a user for the production database. Usually user_name is the app_name

    ]$ sudo -u postgres createuser -s user_name

Now we set the password of the user from postgres console.

    ]$ sudo -u postgres psql
    postgres=# \password user_name

After setting the password we create a database for the user.

    ]$ sudo -u postgres createdb -O user_name app_name_production

Now we go on to install **rvm & ruby**.

    ]$ gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
    ]$ curl -sSL get.rvm.io | bash -s stable
    ]$ rvm requirements
    ]$ rvm install ruby_version       # eg: rvm install 2.2.2
    ]$ rvm use ruby_version

Open your **.bash_profile** and copy last line to **.bash_rc** to enable rvm even in non-login shell.

We installed rvm and ruby. We also specified the ruby we are going to use. Now we will install bundler.

    ]$ gem install bundler

Now we will create the files necessary for **capistrano** for deployment.

    ]$ mkdir app_name
    ]$ mkdir -p app_name/shared/config
    ]$ vim app_name/shared/config/database.yml

We are only adding the production data to **database.yml**

> /home/deploy/app_name/shared/config/database.yml
> {% highlight yaml %}
  production:
    adapter: postgresql
    encoding: unicode
    database: app_name_production  # your db name created after install postgresql
    username: user_name  # your db username
    password: user_password  # your db password
    host: localhost
    port: 5432
  {% endhighlight %}

Then create **application.yml** and add the following

> /home/deploy/app_name/shared/config/application.yml
> {% highlight ruby %}
  `SECRET_KEY_BASE: "8a2ff74119cb2b8f14a85dd6e213fa24d8540fc34dcaa7ef8a35c246ae452bfa8702767d19086461ac911e1435481c22663fbd65c97f21f6a91b3fce7687ce63"`
  {% endhighlight %}

You can generate a new secret by running `rake secret` from your local. Now the server is done. We move to the local and edit **production.rb**.

> /home/user/app_name/config/deploy/production.rb
> {% highlight ruby %}
  server 'your_aws_ec2_public_ip', user: 'deploy', roles: %w{web app db}

  set :branch, :staging  # set branch to something other than master from your version control

  set :puma_env, 'staging'  # capistrano runs puma in production by default. set environment here.
  {% endhighlight %}

Everything is done. To deploy with capistrano just run

    ]$ cap production deploy

All files will be created by capistrano. Migrations will be done and assets will be precompiles as well.

Now we move back to server and restart nginx.

    ]$ sudo service nginx restart


That is the entire setup necessary. Now when you restart nginx if it fails you can find the failure reason with

    ]$ sudo nginx -t

And then search google to find the solution. :D

Go to **http://your_ip** to view the site.
