---
layout: post
title: Notifying deployment from travis to rollbar using before_deploy and after_deploy
date: 2019-10-17 13:51:17 +0530
---


There are 2 ways to go about notifying deployment from travis to rollbar. This particular case uses `redeployment_hook` from a cloud provider (cloud66 used here) and hence we are going to use `before_deploy` and `after_deploy` jobs to do it.

Rollbar has an api which can be used to get notified of deployments. It requires an access-token (project specific) with `post_server_item` scope, environment, revision (`git sha/commit id`). It also takes optional parameters like `rollbar_username`, `local_username`, `comment` and `status`. The details of the api can be found [here](https://docs.rollbar.com/reference#post-deploy).

We are going to use `curl` to notify the deployment to rollbar. First you'll need to create or get the access token from `https://rollbar.com/<organisation>/<project>/settings/access_tokens/`. Basically, its in the respective project settings page. Once you have the token ready, we'll move on to editing the `.travis.yml` file.

Add the following to `.travis.yml`

```yaml
before_deploy:
  - export APPLICATION_NAME=name_of_the_application
  - export DEPLOY_ENV=$(if [ "${TRAVIS_BRANCH}" == "staging" ]; then echo "staging"; else echo "production"; fi)
  - export AUTHOR_NAME="$(git log -1 $TRAVIS_COMMIT --pretty="%aN")"
  - ./.rollbar.sh started
  - export DEPLOY_ID="$(while read -r line; do echo "$line"; done < ~/deploy_id_from_rollbar)"

deploy:
  - provider: cloud66
    redeployment_hook: "url_of_the_redeployment_hook_for_staging"
    on:
      branch: staging
  - provider: cloud66
    redeployment_hook: "url_of_the_redeployment_hook_for_production"
    on:
      branch: release

after_deploy:
  - ./.rollbar.sh succeeded

branches:
  only:
  - staging
  - release
```

There are few things happening above. We'll go through it one by one.

`export APPLICATION_NAME=name_of_the_application`

This particular line is used to create an environment variable. We could have defined it in the `env` section of travis but there is an issue with that. Travis will execute `n` number of jobs if there are `n` enviroment variables defined in `env` section, once for each environment variable. This will make it so that there will only be one environment variable available at once which is defined in the `env` section.


`export DEPLOY_ENV=$(if [ "${TRAVIS_BRANCH}" == "staging" ]; then echo "staging"; else echo "production"; fi)`

This line is used to set the environment so that we can pass it to rollbar. We are using the branch which is getting deployed to do this since travis environment is test. If the branch is staging the `DEPLOY_ENV` is set to staging. Else it is set to production. This is based on the assumption that there are only 2 enviroments where you test using travis.


`export AUTHOR_NAME="$(git log -1 $TRAVIS_COMMIT --pretty="%aN")"`

This line used to get the person who committed or the person who merged the pull request which was responsible for travis starting. This can be passed to rollbar for info.


`./.rollbar.sh started`

This particular line evokes another script with an arguement. We haven't written that script yet. Lets do that now.

```bash
#!/bin/bash
function start_deployment() {
  deploy_id="$(curl --request POST --url https://api.rollbar.com/api/1/deploy/ --data '{"access_token": "project_access_token_from_rollbar", "environment": "'"${DEPLOY_ENV}"'", "revision": "'"${TRAVIS_COMMIT}"'", "comment": "Deployment started in '"${DEPLOYENV}"' for '"${APPLICATION_NAME}"'", "status": "started", "local_username": "'"${AUTHOR_NAME}"'"}' | python -c 'import json, sys; obj = json.load(sys.stdin); print obj["data"]["deploy_id"]')"
  echo "$deploy_id" >> ~/deploy_id_from_rollbar
}

function set_deployment_success() {
  curl --request PATCH --url "https://api.rollbar.com/api/1/deploy/${DEPLOY_ID}?access_token=<project_access_token_from_rollbar>" --data '{"status": "succeeded"}'
}

if [ "$1" == "started" ]
then
  start_deployment started
else
  set_deployment_success succeeded
fi
```

Save it as `.rollbar.sh`. This script takes care of informing rollbar of the notification. Lets dissect it.

```bash
if [ "$1" == "started" ]
then
  start_deployment
else
  set_deployment_success
fi
```

This is the first to be executed. It checks whether the arguement to `.rollbar.sh` is `started` or not. If it is started, it invokes function `start_deployment`. Otherwise, it invokes the function, `set_deployment_success`.


```bash
function start_deployment() {
  deploy_id="$(curl --request POST --url https://api.rollbar.com/api/1/deploy/ --data '{"access_token": "project_access_token_from_rollbar", "environment": "'"${DEPLOY_ENV}"'", "revision": "'"${TRAVIS_COMMIT}"'", "comment": "Deployment started in '"${DEPLOYENV}"' for '"${APPLICATION_NAME}"'", "status": "started", "local_username": "'"${AUTHOR_NAME}"'"}' | python -c 'import json, sys; obj = json.load(sys.stdin); print obj["data"]["deploy_id"]')"
  echo "$deploy_id" >> ~/deploy_id_from_rollbar
}
```

This function executes a **curl** request to rollbar with the relevant data. Replace the `project_access_token_from_rollbar` with your project access token. The other info like environment, revision, application name and author name are obtained from environment variables set it `.travis.yml`. The response is a json which contains the `deploy_id` created by rollbar. This **id** is required to update the rollbar deployment which was started to success.

Since this particular script is executed inside a subshell, any enviroment variable set here won't be available in `travis.yml`. So we'll be writing it to a file using `echo "$deploy_id" >> ~/deploy_id_from_rollbar`.

```
function set_deployment_success() {
  curl --request PATCH --url "https://api.rollbar.com/api/1/deploy/${DEPLOY_ID}?access_token=<project_access_token_from_rollbar>" --data '{"status": "succeeded"}'
}
```

What this function does is to update the status of the rollbar deployment.


Continuing from earlier in travis.yml

```yaml
  - ./.rollbar.sh started
  - export DEPLOY_ID="$(while read -r line; do echo "$line"; done < ~/deploy_id_from_rollbar)"

deploy:
  - provider: cloud66
    redeployment_hook: "url_of_the_redeployment_hook_for_staging"
    on:
      branch: staging
  - provider: cloud66
    redeployment_hook: "url_of_the_redeployment_hook_for_production"
    on:
      branch: release

after_deploy:
  - ./.rollbar.sh succeeded

branches:
  only:
  - staging
  - release
```

Once rollbar script is executed, we will set the **id** of the deployment as an environment variable.

`export DEPLOY_ID="$(while read -r line; do echo "$line"; done < ~/deploy_id_from_rollbar)"`

This line reads the deploy id from the file and set it to `DEPLOY_ID`. The deploy section for cloud66 and other associated providers can be found [here](https://docs.travis-ci.com/user/deployment).

The `after_deploy` script gets executed once the deployment is completed and it notifies rollbar of a successful deployment.


There are some improvements left to be made. I have searched but found no way of letting rollbar know when a deployment fails. Please do let me know if there are some ways for that.
