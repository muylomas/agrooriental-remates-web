function Common() { }

const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { fromIni } = require('@aws-sdk/credential-providers');
const awsConfigEnv = fromIni({
    filepath: './aws_credentials.ini',
    configFilepath: './sns_config.ini',
});

Common.prototype.sms_sender = function (params, callback) {
    console.log("================ sms_sender ================");
    const snsClient = new SNSClient({ region: "us-west-1", credentials: awsConfigEnv });

    snsClient.send(
        new PublishCommand(params),
    ).then(
        (response) => {
            console.log(response);
            callback();
        },
        (error) => {
            console.log(error);
        }
    );

    // {
    //   '$metadata': {
    //     httpStatusCode: 200,
    //     requestId: '7410094f-efc7-5f52-af03-54737569ab77',
    //     extendedRequestId: undefined,
    //     cfId: undefined,
    //     attempts: 1,
    //     totalRetryDelay: 0
    //   },
    //   MessageId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
    // }
};

module.exports = new Common();