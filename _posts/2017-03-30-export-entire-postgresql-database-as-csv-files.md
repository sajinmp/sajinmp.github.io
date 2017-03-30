---
layout: post
title: 'Export entire PostgreSQL database as CSV files'
date: 2017-03-30 20:29:46 +0530
---
I had a situation where I had to get a dump of _postgresql_ database. I tried `pg_dump` but the output was required in **csv**. I got stuck and went over to stackoverflow for rescue. From there I got a working [script](http://dba.stackexchange.com/a/137150). 

But there was a slight problem. I didn't know what the schema table was for my database tables. Again after searching for a long time found hints to commands that could provide me with the schema name. 

    ]$ psql username -h 127.0.0.1 -d database_name  # replace username and database_name
    database_name=# select * from pg_tables where tablename like '%tablename%';  # replace tablename with a name of one of your tables.

From the result, you can find the **schema name**. After that you send the rest to the script.

> script.sh
> {% highlight sh %}
  SCHEMA="schema_name"
  DB="database_name"
  
  psql -Atc "select tablename from pg_tables where schemaname='$SCHEMA'" $DB |\
    while read TBL; do
      psql -c "COPY $SCHEMA.$TBL TO STDOUT WITH CSV HEADER" $DB > $TBL.csv  # directory/$TBL.csv for writing it all to a directory
    done
  {% endhighlight %}

There is only a slight difference between the script I got from stackoverflow. I just added **HEADER** to the script so that every csv file generated will have a header. To get the files run

  ]$ sh script.sh

All **csv** will be generated in the same directory as that of _script.sh_

Once all the csv are generated, I can simply run an `scp` command to get all of them to my local system or better yet compress them from server and use scp.

    ]$ scp -r server_username@ip:path_to_directory/* destination_path_in_local  # If you are copying it as a directory.
    ]$ scp server_username@ip:path_to_compressed_file destination_path_in_local  # If you are copying a compressed file

Server access is definitely necessary for this though (although I know that everyone already knows :D). Hope this is helpful.
