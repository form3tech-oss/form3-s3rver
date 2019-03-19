'use strict';

const _ = require('lodash');
const Fs = require('fs');
const Path = require('path');
const Logger = require('./logger');

const DefaultConfig = {
    directory: "./s3-tmp",
    hostname: "0.0.0.0",
    port: 5000,
    silent: false,
    buckets: [
        {
            name: "bucket1",
            filters: [
                {
                    name: "log",
                    events: [],
                    sendTo: {
                        log: "info"
                    }
                }
            ]
        }
    ]
};

/**
 *
 * @return {{directory:string, hostname:string, port: integer, buckets:Array<{name: string filters: Array}>}}
 */
function configLoader(){
    let configPath;
    let config;

    Logger.info('Loading Configurations');
    configPath = process.env['S3_CONFIG'];
    if( _.isEmpty(configPath) ){
        configPath = Path.resolve(process.cwd(), 's3.json');
    }
    Logger.info(`Trying to load configuration from '${configPath}'`);
    if (Fs.existsSync(configPath)){
        try{
            config = require(configPath);
        }catch (e) {
            Logger.error(`Fail to load configurations: ${configPath}. Using Default configs.`)
        }
    }
    config = _.defaults(config, DefaultConfig);
    if (!_.isEmpty(process.env['S3_PATH'])){
        config.directory = process.env['S3_PATH'];
    }
    if (!_.isEmpty(process.env['S3_HOST'])){
        config.hostname = process.env['S3_HOST'];
    }
    if (!_.isEmpty(process.env['S3_PORT'])){
        config.port = process.env['S3_PORT'];
    }
    Logger.info('Configurations loaded: \n', JSON.stringify(config, null, 4));
    return config;
}

module.exports = function () {
    return configLoader();
}();