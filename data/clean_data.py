#!/usr/bin/env python

import simplejson
import itertools


def sliding_window(seq, width=2):
    it = iter(seq)
    result = tuple(itertools.islice(it, width))
    if len(result) == width:
        yield result
    for elm in it:
        result = result[1:] + (elm,)
        yield result


def cond_chunk(dataset, cond, argc=2):
    result = [[]]

    for slide in sliding_window(dataset, argc):
        if cond(slide):
            result.append([])

        result[-1].append(slide[-1])

    return result


def extract_data(filename):

    with open(filename) as f:
        contents = simplejson.load(f)

    for index, row in enumerate(contents['rows']):
        lat   = row['doc']['latitude']
        lon   = row['doc']['longitude']
        acc   = row['doc']['accuracy']
        time  = row['doc']['time']

        ssids = dict()
        for elm in row['doc']['ssids']:
            ssids[elm['BSSID']] = elm['frequency'], elm['level']

        yield (lat, lon, acc, time, ssids)


def splitfilter(dataset, cond):
    retval = ([], [])
    for elm in dataset:
        retval[cond(elm)].append(elm)

    return retval


def main():

    time_key = lambda (_lat, _lon, _acc, time, _ssids): time
    extracted_data = sorted(extract_data("db_dump.json"), key=time_key)

    acceptable_accuracy = lambda (_lat, _lon, acc, _time, _ssids): acc < 10
    (failed, succ) = splitfilter(extracted_data, acceptable_accuracy)

    NUM_SECONDS = 30
    acceptable_t_delta = lambda (
        (_lata, _lona, _acca, timea, _ssidsa),
        (_latb, _lonb, _accb, timeb, _ssidsb)
    ): timeb - timea > NUM_SECONDS * 1000
    datasets = cond_chunk(succ, acceptable_t_delta, 2)
    datasets = sorted(datasets, key=len)

    print map(len, datasets)

    # onefourth = len(succ) // 4
    # testing, training = succ[:onefourth], succ[onefourth:]



if __name__ == '__main__':
    main()
