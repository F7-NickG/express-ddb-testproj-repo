const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const {response} = require("express");
AWS.config.update({
    region: 'us-east-1'
});
const dynamo = new AWS.DynamoDB.DocumentClient();
const dynamoTableName = 'express-to-ddb-testset';

router.get('/', async (req, res) => {
    const params = {
        TableName: dynamoTableName,
        Key: {
            'productId': req.query.productId
        }
    }
    await dynamo.get(params).promise().then(response => {
        res.json(response.Item);
    }, error => {
        console.error('custom error handling goes here, this is just a console out: ', error);
        res.status(500).send(error);
    });
});

router.get('/all', async (req, res) => {
    const params = {
        TableName: dynamoTableName
    }
    try {
        const allProducts = await scanDynamoRecords(params, []);
        const body = {
            products: allProducts
        }
        res.json(body);
    } catch(error) {
        console.error('custom error handling goes here, this is just a console out: ', error);
        res.status(500).send(error);
    }
});

router.post('/', async (req, res) => {
    const params = {
        TableName: dynamoTableName,
        Item: req.body
    }
    await dynamo.put(params).promise().then(() => {
        const body = {
            Operation: 'SAVE',
            Message: 'SUCCESS',
            Item: req.body
        }
        res.json(body);
    }, error => {
        console.error('custom error handling goes here, this is just a console out: ', error);
        res.status(500).send(error);
    })
});

router.patch('/', async (req, res) => {
    const params = {
        TableName: dynamoTableName,
        Key: {
            'productId': req.body.productId
        },
        UpdateExpression: `set ${req.body.updateKey} = :value`,
        ExpressionAttributeValues: {
            ':value': req.body.updateValue
        },
        ReturnValues: 'UPDATED_NEW'
    }
    await dynamo.update(params).promise().then(response => {
        const body = {
            Operation: 'UPDATE',
            Message: 'SUCCESS',
            UpdatedAttributes: response
        }
        res.json(body);
    }, error => {
        console.error('custom error handling goes here, this is just a console out: ', error);
        res.status(500).send(error);
    });
});

router.delete('/', async (req, res) => {
    const params = {
        TableName: dynamoTableName,
        Key: {
            'productId': req.body.productId
        },
        ReturnValues: 'ALL_OLD'
    }
    await dynamo.delete(params).promise().then(response => {
        const body = {
            Operation: 'DELETE',
            Message: 'SUCCESS',
            Item: response
        }
        res.json(body);
    }, error => {
        console.error('custom error handling goes here, this is just a console out: ', error);
        res.status(500).send(error);
    });
});

async function scanDynamoRecords(scanParams, itemArray) {
    try {
        const dynamoData = await dynamo.scan(scanParams).promise();
        itemArray = itemArray.concat(dynamoData.Items);
        if(dynamoData.LastEvaluatedKey) {
            scanParams.ExclusiveStartKey = dynamoData.LastEvaluatedKey;
            return await scanDynamoRecords(scanParams, itemArray);
        }
        return itemArray;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = router;