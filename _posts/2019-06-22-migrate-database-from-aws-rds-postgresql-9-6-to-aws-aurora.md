---
layout: post
title: Migrate database from AWS RDS Postgresql 9.6 to AWS Aurora
date: 2019-06-22 13:49:31 +0530
---

Direct migration from postgresql to aurora is only supported for postgres engine versions `9.6.3` and `9.6.6`. We had the version `9.6.11` which could not have a direct transition to aurora. So a couple more of steps had to be taken for the migration of postgres db to aurora. The process are as follows.

First, Stop anymore writes/connections to the existing database. This is so that the new database does not miss any of the old data. Once the existing connections are done, take a dump of the database using the below code. Password will be prompted.

```bash
$ pg_dump -h host -Fc -o -U user_name database_name > dumpfile.dump
```

Create an aurora cluster with postgresql engine and configuration based on requirements. 

Once the instance is created, you can connect to the new database with the endpoint url mentioned. If the database name that you require is different, connect to psql and create a new database like below. This is how you create a new database in an existing rds instance. Password will be prompted.

```bash
$ psql -h host -U user_name -d database_name
```

```sql
# create database new_database_name with owner owner_name;
```

Now you can quit the psql and can initiate the restore of the existing data into the new cluster's writer using the following command. Make sure to use the writer and not the reader.

```bash
    $ pg_restore -h host -U user_name -d database_to_restore_to dumpfile.dump
```

This should restore your dump to the database. There are chances that you may get couple of errors which will be ignored if extensions are being used. The common structure of error should be as following

```err
pg_restore: [archiver (db)] Error while PROCESSING TOC:
pg_restore: [archiver (db)] Error from TOC entry 1234; 0 0 COMMENT EXTENSION "extension_name"
pg_restore: [archiver (db)] could not execute query: ERROR:  must be owner of extension extension_name
    Command was: COMMENT ON EXTENSION extension_name IS 'usage_of_extension';



WARNING: errors ignored on restore: 2
```

`pg_restore` has ignored these errors. The data was checked and there were no inconsistancies. But its better for you to make sure.

Now your new aurora postgresql cluster has the contents of the entire database. The old postgresql instance can be removed and the aurora cluster can be used to replace it.
