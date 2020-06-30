'use strict';
const filter = require("rxjs/operators").filter;
const { fromEvent } = require('rxjs');
const S3rver = require("s3rver");
const Fs     = require('fs');
const Path   = require('path');

const Logger       = require('./lib/logger');
const Config       = require('./lib/configLoader');
const Notification = require('./lib/notification');

// Create S3-temp directory;
if (!Fs.existsSync(Config.directory)) {
    Fs.mkdirSync(Config.directory);
}
// Create Buckets
Config.buckets.forEach( bucket => {
    let bucketPath = Path.join(process.cwd(), Config.directory, bucket.name);
    if ( !Fs.existsSync(bucketPath) ){
        Fs.mkdirSync(bucketPath);
    }
});

Logger.info("Launching S3 server");
const server = new S3rver(Config)
    .run((err, {host, port} = {}) => {
        if (err) {
            Logger.error(err);
            process.exit(1);
        } else {
            Logger.log('now listening on host %s and port %d', host, port);
        }
    });

const Notifications = Notification.factoryNotifications(Config.buckets);

Notifications.forEach( notification => {
    const s3Events = fromEvent(server, 'event');
    s3Events
        .pipe( filter(e => notification.doFilter(e)) )
        .subscribe(e => notification.doNotify(e) );
});
Logger.info("Ready!");
