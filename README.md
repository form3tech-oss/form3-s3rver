
# Form3 S3rver

This project is an extension of [S3rver Project](https://github.com/jamhall/s3rver) and it implements the basic 
**AWS S3 Event Notification** system. The Amazon S3 notification feature enables you to receive notifications when 
certain events happen in your bucket.

This feature allow us to test async operation using AWS S3 Buckets using the following protocols:
 * SQS - sends a message to an AWS SQS Queue (or fake SQS service);
 * SNS - sends a message to an AWS SNS Notification (or fake SNS service);
 
## Configuration

This service is configured through environment variables or/and json file. The next sections will describe in
detail how you can configure the service.

### Environment Variables 

It is possible to use environment variables to configure the basic settings of this service. The next
table described which variables are used and how they are used.

| Name      | Optional | Description                                                                                |  
|:---------:|:--------:|:------------------------------------------------------------------------------------------:|
| S3_PATH   | Y | Sets the path used by S3rver to store all received data (default: "./s3-tmp")|
| S3_HOST   | Y | Sets tcp host used by S3rver (default: "0.0.0.0")|
| S3_PORT   | Y | Sets tcp port used by S3rver (default: 5000)|
| S3_CONFIG | Y | Sets the file path used by S3rver to load the configurations (default: ./s3.json)|

**AWS S3 Event Notification** can only be configured through Json file configuration.

### Json file

This **Json file** configuration allow us to do fine grain configuration like **AWS S3 Event Notifications**.
An example of this file can be found [here](sampleS3.json). The following table describes all properties used
so you can configure the service to take the most of all features.


| Name                                           | Optional | Type     | Description                                                                                |
|:----------------------------------------------|:--------:|:---------:|:------------------------------------------------------------------------------------------|
| directory                                      | Y        | String   | Sets the path used by S3rver to store all received data (default: "./s3-tmp") |
| hostname                                       | Y        | String   | Sets tcp host used by S3rver (default: "0.0.0.0") |
| port                                           | Y        | Numeric  | Sets tcp port used by S3rver (default: 5000)|
| silent                                         | Y        | Boolean  | Enables or disables internal S3rver logs (default: false) |
| buckets                                        | Y        | Array    | Array of objects containing bucket details. All buckets will be created automatically |
| buckets[\*].name                               | N        | String   | Bucket Name |
| buckets[\*].filters                            | Y        | Array    | Array of filters that can be applied to a specific bucket |
| buckets[\*].filters[\*].name                   | N        | String   | Sets the filter name |
| buckets[\*].filters[\*].events                 | Y        | Array    | Array of strings used to filter by even type. Supported event types are: s3:ObjectCreated:Put, s3:ObjectCreated:Post, s3:ObjectCreated:Copy, s3:ObjectRemoved:Delete |
| buckets[\*].filters[\*].prefix                 | Y        | String   | Allow us to filter by S3 Key prefix |
| buckets[\*].filters[\*].suffix                 | Y        | String   | Allow us to filter by S3 Key suffix |
| buckets[\*].filters[\*].notification           | Y        | Object   | Notification Object were the event notification is configured |
| buckets[\*].filters[\*].notification.type      | N        | String   | Set Notification Type. At this moment the suported protocols are: sqs & sns |
| buckets[\*].filters[\*].notification.queueUrl  | N        | String   | Sets the SQS queue url. This field is mandatory when *type* is set to **sqs**. |
| buckets[\*].filters[\*].notification.region    | Y        | String   | Sets the AWS region (default: eu-west-1).  |
| buckets[\*].filters[\*].notification.topicArn  | N        | String   | Sets the SNS topic ARN. This field is mandatory when *type* is set to **sns**.  |
| buckets[\*].filters[\*].notification.endpoint  | Y        | String   | Sets the SNS endpoint when used along with mocked SNS services. By default it used AWS endpoints. |


# Contributions

At [Form3](https://form3.tech/) we recognize all the value and effort of the OpenSource community and we want to give a special thanks for all 
[S3rver Project](https://github.com/jamhall/s3rver) contributors.


