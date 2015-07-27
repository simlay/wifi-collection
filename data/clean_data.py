#!/usr/bin/env python

import simplejson
import pandas as pd

def extract_data(filename):

    with open(filename) as f:
        contents = simplejson.load(f)

    for index, row in enumerate(contents['rows']):
        lat = row['doc']['latitude']
        lon = row['doc']['longitude']
        acc = row['doc']['accuracy']

        ssids = dict()
        for elm in row['doc']['ssids']:
            ssids[elm['BSSID']] = elm['frequency'], elm['level']

        yield (lat, lon, acc, ssids)

def splitfilter(dataset, cond):
    retval = ([], [])
    for elm in dataset:
        retval[cond(elm)].append(elm)

    return retval

def main():
    acceptable_accuracy = lambda (lat, lon, acc, ssids): acc > 10
    (failed, succ) = splitfilter(extract_data("db_dump.json"), acceptable_accuracy)
    onefourth = len(succ) // 4
    testing, training = succ[:onefourth], succ[onefourth:]
    print training[0]
    print testing[0]


if __name__ == '__main__':
    main()
