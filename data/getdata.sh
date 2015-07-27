#!/bin/bash

# wget http://ec2-54-69-189-127.us-west-2.compute.amazonaws.com/locationssids/_all_docs?include_docs=true
wget http://ec2-54-69-189-127.us-west-2.compute.amazonaws.com/simple_set/_all_docs?include_docs=true
mv _all_docs?include_docs=true db_dump.json

