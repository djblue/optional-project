#!/bin/sh

# quickly archive git project

dir="$(basename `pwd`)"

git archive -o ${dir}.zip --prefix=${dir}/ HEAD
