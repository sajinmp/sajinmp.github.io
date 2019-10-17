---
layout: post
title: Upgrade elasticsearch from 5 to 6.3
date: 2019-06-22 13:50:13 +0530
---

This would require some code changes as well. First update the `docker-compose.yaml` file to get the image for elasticsearch version `6.3.2`

```
    # docker-compose.yaml
    services:
      elasticsearch:
        image: docker.elastic.co/elasticsearch/elasticsearch:6.3.2
```

**Elasticsearch 6** has some breaking changes. The mapping type `string` is no longer allowed for indexing. It is split into `text` and `keyword`. `keyword` is used for aggregation, sorting etc while `text` supports full text searching. Change the existing indexes with type `string` to `text` and `keyword` based on the requirements.

The old indexes made by elasticsearch for `string` type will still be read if the indexes were made on **elasticsearch 5**.
