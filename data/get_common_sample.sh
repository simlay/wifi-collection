#!/bin/bash

most_common=$1

if [ -z $most_common ]; then
    most_common=1
fi

cat tables.csv | awk -F, '{print $7'} | sort -n | uniq -c | sort -n | awk '{print $2}' | tail -n $(($most_common + 1)) | head -n 1 | xargs -I {} grep {} tables.csv
