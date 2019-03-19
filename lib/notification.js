'use strict';

const _ = require('lodash');
const AWS = require('aws-sdk');
const URL = require('url');
const Logger = require('./logger');

class Notification {
    constructor(config) {
        this._config = config;
    }

    doFilter(s3Event) {
        let record = _.get(s3Event, 'Records[0]');
        if (!record || record.s3.bucket.name !== this._config.bucketName) {
            return false;
        }
        let pass = true;

        if (_.isArray(this._config.events) && this._config.events.length > 0 ) {
            pass = pass && this._config.events.includes(record.eventName)
        }
        if (this._config.prefix && this._config.prefix !== "") {
            pass = pass && record.s3.object.key.startsWith(this._config.prefix);
        }
        if (this._config.suffix && this._config.suffix !== "") {
            pass = pass && record.s3.object.key.endsWith(this._config.suffix);
        }
        return pass;
    }

    doNotify(s3Event){
        throw new Error("Missing implementation")
    }
}

class LogNotification extends Notification{
    /**
     * @param {Object} config
     * @param {Object} config.notification
     * @param {string} config.notification.level
     */
    constructor(config){
        super(config)
    }
    doNotify(s3Event) {
        let level = _.get(this._config, 'notification.level', 'info');
        switch(level.toLocaleLowerCase()){
            case "info":
                Logger.info(`Firing Notification on '${this._config.bucketName}' for event '${this._config.filterName}' - ` + JSON.stringify(s3Event));
                break;
            case "debug":
                Logger.debug(`Firing Notification on '${this._config.bucketName}' for event '${this._config.filterName}' - ` + JSON.stringify(s3Event));
                break;
            case "log":
            default:
                Logger.log(`Firing Notification on '${this._config.bucketName}' for event '${this._config.filterName}' - ` + JSON.stringify(s3Event));
                break;
        }
    }
}

class SQSNotification extends Notification{
    /**
     * @param {Object} config
     * @param {Object} config.notification
     * @param {string} config.notification.queueUrl
     * @param {string} config.notification.region
     */
    constructor(config){
        super(config);

        let sqsUrl = URL.parse(config.notification.queueUrl);
        this._sqs = new AWS.SQS({
            region: config.notification.region,
            endpoint: `${sqsUrl.protocol}//${sqsUrl.host}`,
        });
    }

    doNotify(s3Event) {
        let params = {
            MessageBody: JSON.stringify(s3Event),
            QueueUrl: this._config.notification.queueUrl
        };
        this._sqs.sendMessage(params, (err) => {
            if (err){
                Logger.error("Fail to send notification to SQS with error ", err);
            }
        })
    }
}

class SNSNotification extends Notification{
    /**
     * @param {Object} config
     * @param {Object} config.notification
     * @param {string} config.notification.topicArn
     * @param {string} config.notification.region
     * @param {string} config.notification.endpoint
     */
    constructor(config){
        super(config);
        this._sns = new AWS.SNS({
            region: config.notification.region,
            endpoint: config.notification.endpoint,
        });
    }

    doNotify(s3Event) {
        let params = {
            Message: JSON.stringify(s3Event),
            TopicArn: this._config.notification.topicArn
        };
        this._sns.publish(params, (err) => {
            if (err){
                Logger.error("Fail to send notification to SNS with error ", err);
            }
        });
    }
}

function notificationFactory( notificationCfg ){
    let notificationType = _.get(notificationCfg, 'notification.type', 'log');
    switch (notificationType.toLowerCase()) {
        case "sqs":
            Logger.info(`Creating SQS Event Notification '${notificationCfg.filterName}' for S3Bucket '${notificationCfg.bucketName}'`);
            return new SQSNotification(notificationCfg);
        case "sns":
            Logger.info(`Creating SNS Event Notification '${notificationCfg.filterName}' for S3Bucket '${notificationCfg.bucketName}'`);
            return new SNSNotification(notificationCfg);
        case "log":
            Logger.info(`Creating Console Log Event Notification '${notificationCfg.filterName}' for S3Bucket '${notificationCfg.bucketName}'`);
            return new LogNotification(notificationCfg);
        default:
            Logger.warn(`Unknown notificationType '${notificationType}' fallback to log`);
            return new LogNotification(notificationCfg);

    }
}


module.exports = {
    /**
     *
     * @param {Object[]} buckets
     * @param {string} buckets[].name
     * @param {Object[]} buckets[].filters
     * @param {string} buckets[].filters[].name
     * @param {string} [buckets[].filters[].prefix]
     * @param {string} [buckets[].filters[].suffix]
     * @param {string[]} buckets[].filters[].events
     * @param {Object} buckets[].filters[].sentTo
     * @param {string} [buckets[].filters[].sentTo.log]
     * @param {string} [buckets[].filters[].sentTo.sns]
     * @param {string} [buckets[].filters[].sentTo.sqs]
     *
     */
    factoryNotifications: function(buckets){
        let notificationConfigs = [];
        if(!_.isArray(buckets)){
            return [];
        }
        Logger.info("Creating Event Notification Listeners");
        buckets
            .filter ( bucket => _.isArray(bucket.filters) && bucket.filters.length > 0)
            .forEach( ({name, filters}) => {
                filters.forEach( filter => {
                    notificationConfigs.push({
                        bucketName:   name,
                        filterName:   filter.name,
                        events:       filter.events,
                        notification: filter.notification,
                        prefix:       filter.prefix,
                        suffix:       filter.suffix
                    });
                })
            });
        return notificationConfigs.map(notificationFactory);
    }
};