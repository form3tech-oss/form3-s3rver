'use strict';

const AWS = require('aws-sdk');
const UUID = require('uuid/v4');

describe('Given a Form3 S3 Service', () => {

    let s3 = new AWS.S3({
        endpoint: "http://127.0.0.1:5000",
        s3ForcePathStyle: true
    });
    let sqs = new AWS.SQS({
        region: "eu-west-1",
        endpoint: "http://127.0.0.1:1212"
    });

    function purgeQueues (){
        let queues = [
            'http://127.0.0.1:1212/queue/local-bucket1-events',
            'http://127.0.0.1:1212/queue/local-bucket2-events'
        ];
        return Promise.all(queues.map( queue => new Promise((resolve, reject) => {
            let params = {
                QueueUrl: queue
            };
            console.info(`Purging ${queue}`);
            sqs.purgeQueue(params, (err) => {
                err ? reject(err) : resolve()
            });
        })))
    }


    describe("SNS Notifications must be fired when", () => {

        beforeEach(() => {
            return purgeQueues();
        });

        it("When creating file on 's3://bucket1/folder1'", (done) => {
            let s3Params = {
                Body: "fake-payload",
                Bucket: 'bucket1',
                Key: `folder1/${UUID()}.json`
            };
            let sqsParams = {
                QueueUrl: 'http://127.0.0.1:1212/queue/local-bucket1-events',
                WaitTimeSeconds: 5,
                VisibilityTimeout: 1,
                MaxNumberOfMessages: 10
            };
            s3.putObject(s3Params, (err) => {
                expect(err).toBeNull();
                sqs.receiveMessage(sqsParams, (err, data) => {
                    expect(err).toBeNull();
                    expect(data.Messages).not.toBeNull();
                    expect(data.Messages.length).toBe(1);

                    let message = JSON.parse(data.Messages[0].Body);
                    expect(message.Records).not.toBeNull();
                    expect(message.Records.length).toBe(1);
                    expect(message.Records[0].eventSource).toEqual("aws:s3");
                    expect(message.Records[0].s3.bucket.name).toEqual(s3Params.Bucket);
                    expect(message.Records[0].s3.object.key).toEqual(s3Params.Key);
                    done()
                });
            });

        }, 10000);
    });

    describe("SQS Notifications must be fired when", () => {

        beforeEach(() => {
            return purgeQueues();
        });

        it("When creating file on 's3://bucket2/folder1'", (done) => {

            let s3Params = {
                Body: "fake-payload",
                Bucket: 'bucket2',
                Key: `folder1/${UUID()}.json`
            };
            let sqsParams = {
                QueueUrl: 'http://127.0.0.1:1212/queue/local-bucket2-events',
                WaitTimeSeconds: 5,
                VisibilityTimeout: 1,
                MaxNumberOfMessages: 10
            };
            s3.putObject(s3Params, (err) => {
                expect(err).toBeNull();
                sqs.receiveMessage(sqsParams, (err, data) => {
                    expect(err).toBeNull();
                    expect(data.Messages).not.toBeNull();
                    expect(data.Messages.length).toBe(1);

                    let message = JSON.parse(data.Messages[0].Body);
                    expect(message.Records).not.toBeNull();
                    expect(message.Records.length).toBe(1);
                    expect(message.Records[0].eventSource).toEqual("aws:s3");
                    expect(message.Records[0].s3.bucket.name).toEqual(s3Params.Bucket);
                    expect(message.Records[0].s3.object.key).toEqual(s3Params.Key);
                    done()
                });
            });
        }, 10000);
    });

    describe("No notifications must be fired when", () => {
        beforeAll(() => {
            return purgeQueues();
        });

        it("When creating file on 's3://bucket1/folder2'", (done) => {
            let s3Params = {
                Body: "fake-payload",
                Bucket: 'bucket1',
                Key: `folder2/${UUID()}.json`
            };
            let sqsParams = {
                QueueUrl: 'http://127.0.0.1:1212/queue/local-bucket1-events',
                WaitTimeSeconds: 2,
                VisibilityTimeout: 1,
                MaxNumberOfMessages: 10
            };
            s3.putObject(s3Params, (err) => {
                expect(err).toBeNull();
                sqs.receiveMessage(sqsParams, (err, data) => {
                    expect(err).toBeNull();
                    expect(data.Messages).toBeUndefined();
                    done()
                });
            });

        });

        it("When creating file on 's3://bucket2/folder2', Then no SQS notification should be fired", (done) => {
            let s3Params = {
                Body: "fake-payload",
                Bucket: 'bucket2',
                Key: `folder2/${UUID()}.json`
            };
            let sqsParams = {
                QueueUrl: 'http://127.0.0.1:1212/queue/local-bucket2-events',
                WaitTimeSeconds: 2,
                VisibilityTimeout: 1,
                MaxNumberOfMessages: 10
            };
            s3.putObject(s3Params, (err) => {
                expect(err).toBeNull();
                sqs.receiveMessage(sqsParams, (err, data) => {
                    expect(err).toBeNull();
                    expect(data.Messages).toBeUndefined();
                    done()
                });
            });
        });
    });
});
