---
layout: post
title: 'Setup Amazon S3 with Carrierwave and Rails'
date: 2015-09-21 19:12:27
keywords: 'rails, amazon s3, aws, s3, carrierwave, s3 with carrierwave, setup s3 with rails'
description: 'I had to setup an Amazon S3 bucket to move all the uploaded files to cloud. It was an urgent task because'
---
Yesterday I had to setup an **Amazon S3 bucket** to move all the uploaded files to cloud. It was an urgent task because we lost our data once due to our server crashing. It is a pretty easy task but I got stuck somewhere due to my foolishness. So if there are some other fools out there like me, this post is mainly for them as well as all the people who are setting up S3 for the first time.

First add the **fog** gem to your gemfile and run bundle.

    # Gemfile
    gem 'fog'
    
After running the bundle you will see that few gems are installed. Now we have to setup the `access id` and `secret key` for amazon. Now there are a few ways to go about this, but I will go in a way which I feel is easy. Add the secrets to the `secrets.yml` file. I am only setting it up for development now. So if you want it in production you have to add them to production as well.

    # config/secrets.yml
    
    development:
      bucket_name: s3-bucket-name
      aws_access_id: access-id-over-here
      aws_secret_key: secret-key-over-here
      host: 'localhost:3000'
      secret_key_base: my-app-secret-key
      
    test:
      secret_key_base: my-app-secret-key
    
    production:
      bucket_name: s3-bucket-name
      aws_access_id: access-id-over-here
      aws_secret_key: secret-key-over-here
      host: 'example.com'
      secret_key_base: my-app-secret-key
      
Now that you have added the credentials to secrets, don't forget to remove the file from version controlling. You can access the contents of secrets using `Rails.application.secrets`, so there is no problem to access it in another file.

Since you have setup the secrets and all, move on to create an initializer for carrierwave.

    # config/initializers/carrierwave.rb
    
    CarrierWave.configure do |config|
      config.fog_credentials = {
        provider: 'AWS',
        aws_access_key_id: Rails.application.secret.aws_access_id,
        aws_secret_access_key: Rails.application.secret.aws_secret_key
      }
      
      config.fog_directory = Rails.application.secret.bucket_name
    end
    
That concludes the settings for Carrierwave. Now you just have to go to the `Uploader` and change the `storage`.
    
    # app/uploaders/example_uploader.rb
    
    # storage :file       Comment it out
    storage :fog        # Uncomment it
    
And that is the completion of setting up S3 with carrierwave. I will write another post on how to reformat all the existing files and folders as you need to transfer it to S3.
