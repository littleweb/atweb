#!/bin/sh
tail -F ./env | while read line; do
if echo "$line" | grep -q '/data'; then
    # do your stuff
fi
done