---
layout: post
title: Upgrade docker-compose file version from 2 to 3.7
date: 2019-06-22 13:50:35 +0530
---

There was not much of a change with the docker-compose file version. Just had to change the version from 2 to 3.7.
```
    # docker-compose.yaml
    version '2'
```

```
    # docker-compose.yaml
    version '3.7'
```

Docker-compose `2` is compatible with docker engine versions `1.10.0+` while `3.7` is only compatible with `18.06.0+`. So if the docker version running on machine is less than `18.06.0` it will have to be upgraded. Current docker engine version can be found from bash console(terminal) using `docker -v`.
