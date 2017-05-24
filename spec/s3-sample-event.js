// copied from console.log to aws CloudWatch logs

exports.s3Event = {
  "Records": [
    {
      "eventVersion": "2.0",
      "eventSource": "aws:s3",
      "awsRegion": "eu-west-2",
      "eventTime": "2017-05-22T21:24:15.524Z",
      "eventName": "ObjectCreated:Put",
      "userIdentity": {
        "principalId": "A33REH6A3VFJKY"
      },
      "requestParameters": {
        "sourceIPAddress": "82.31.1.2"
      },
      "responseElements": {
        "x-amz-request-id": "B1F08A2194F599E8",
        "x-amz-id-2": "FW0UfjzxygmeSzPU57zQgoPuOSarO8LutOdITOWpLGaVWcRUmWZbN5p+X/QeNbHof5lFWR1EXYQ="
      },
      "s3": {
        "s3SchemaVersion": "1.0",
        "configurationId": "xml-added",
        "bucket": {
          "name": "first-xml",
          "ownerIdentity": {
            "principalId": "A33REH6A3VFJKY"
          },
          "arn": "arn:aws:s3:::first-xml"
        },
        "object": {
          "key": "example-1.xml.txt",
          "size": 1973,
          "eTag": "8766404e27500e6579783650af8a3af8",
          "sequencer": "00592356FF78720EF2"
        }
      }
    }
  ]
};