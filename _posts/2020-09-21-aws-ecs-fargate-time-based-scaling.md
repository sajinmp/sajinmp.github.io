---
layout: post
title: AWS ECS Fargate Time Based Scaling
date: 2020-09-21 17:16:12 +0530
---


There was a need for me to scale an ECS Fargate service based on time. But the options provided by Fargate service did not provide scheduled scaling. The available options are

* Target Scaling - There are 3 metrics that can be used to scale - Average cpu utilization, average memory utilization and Loadbalancer request count per target.
* Step Scaling - The main metrics used are of cpu and memory utilization but there are more available metrics such as average, sum, maximum utilization etc.

The problem was that scaling had to be time based. I took a look at AWS Autoscaling but it didn't help since the scaling target selection was based on Cloudfront template, tags or EC2 autoscaling configuration. Tags couldn't be added because the new ARN formatted was not opted yet.

On further reading, I found some `aws cli` commands which could be used to scale a service. It maked use of **AWS Autoscaling** itself but it was way easier.

First you have to register the scaling target. This could be done using `register-scalable-target`

```bash
# Registering the target to scale
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/<cluster name>/<service name> \
  --min-capacity 1 \
  --max-capacity 2
```

Here we are registering the service as **ecs**, the item to be scaled which is the **DesiredCount** here and the resource id of the target - **service/<cluster>/<servicename>** along with a min and max capacity.

Now to schedule a scale up

```bash
# Scaling up/out the service
aws application-autoscaling put-scheduled-action --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/<cluster name>/<service name> \
  --scheduled-action-name <action-name-you-want> \
  --schedule "cron(10 9 * * ? *)" \
  --scalable-target-action MinCapacity=3,MaxCapacity=4
```

There is a name of the scheduled action, the schedule it should follow and how much it should be scaled. Here, the minimum number of tasks running will become 3.

The other related commands are to list scalable targets, list scheduled actions, delete scheduled actions and delete a scalable target.

```bash
# List scalable targets
aws application-autoscaling describe-scalable-targets --service-namespace ecs

# List scheduled actions
aws application-autoscaling describe-scheduled-actions --service-namespace ecs

# Delete scheduled action
aws application-autoscaling delete-scheduled-action \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/<cluster name>/<service name> \
  --scheduled-action-name <action-name-you-gave>

# Delete scalable target
aws application-autoscaling deregister-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/<cluster name>/<service name>
```
