#!/usr/bin/env bash
set -x

if [[ "$TRAVIS_TAG" == "" ]]; then
    echo "Nothing to do"
    exit
fi

docker tag tech.form3/form3-s3rver 288840537196.dkr.ecr.eu-west-1.amazonaws.com/tech.form3/form3-s3rver:$TRAVIS_TAG
docker tag tech.form3/form3-s3rver 288840537196.dkr.ecr.eu-west-1.amazonaws.com/tech.form3/form3-s3rver:latest
docker push 288840537196.dkr.ecr.eu-west-1.amazonaws.com/tech.form3/form3-s3rver:$TRAVIS_TAG
docker push 288840537196.dkr.ecr.eu-west-1.amazonaws.com/tech.form3/form3-s3rver:latest
