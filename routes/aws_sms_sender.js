function Common() { }

const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { fromIni } = require('@aws-sdk/credential-providers');
const awsConfigEnv = fromIni({
    filepath: './aws_credentials.ini',
    configFilepath: './sns_config.ini',
});

Common.prototype.sms_sender = function (params, callback) {
    const snsClient = new SNSClient({ region: "us-west-1", credentials: awsConfigEnv });

    snsClient.send(
        new PublishCommand(params),
    ).then(
        (response) => {
            callback();
        },
        (error) => {
            console.log(error);
        }
    );
};

module.exports = new Common();