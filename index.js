'use strict';

var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient();



exports.handler = function (event, context, callback) {
//    context.callbackWaitsForEmptyEventLoop = false;

//    var key = event.Records[0].s3.object.key;

    var message = JSON.parse(event.Records[0].Sns.Message);

    var key = message.Records[0].s3.object.key;
    var bucket = message.Records[0].s3.bucket.name;

    var sourceKey = decodeURIComponent(key.replace(/\+/g, ' '));

    var uniqueVideoKey = sourceKey.split('/')[0];

//Firebaseでなく、DynamoDBのテーブルを変更している。
    console.log('Updating video entry to DynamoDB at key:', uniqueVideoKey);

    var params = {
      TableName: '24-hour-video',
      // ↓ Kは大文字！
      Key:{
        id: uniqueVideoKey
      },
      ExpressionAttributeNames: {
        '#k': 'key',
        '#t': 'transcoding',
        '#b': 'bucket'
      },
      ExpressionAttributeValues: {
        ':newTranscoding': false,
        ':newBucket': process.env.S3
      },
      UpdateExpression: 'set #k.#t = :newTranscoding, #k.#b = :newBucket'
    }

    docClient.update(params, function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log('データは　' + data + 'にアップデートされました');
      }
    });

};
