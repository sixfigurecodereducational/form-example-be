import AWS from 'aws-sdk';
import {v4 as uuidv4} from 'uuid';


const dynamodb = new AWS.DynamoDB.DocumentClient();
const database_name = process.env.DYNAMO_TABLE_NAME;

export async function createApplication(name, email, age, message) {

    const id = uuidv4();

    const application = {
        id,
        name,
        email,
        age,
        message,
        timestamp: new Date().toISOString()
    };

    const params = {
        TableName: database_name,
        Item: application
    };

    try {
        await dynamodb.put(params).promise();
    } catch (err) {
        console.error(err);
        throw new Error('Error submitting application');
    }

}

export async function updateApplication(id, name, email, age, message) {
    const params = {
        TableName: database_name,
        Key: {id},
        UpdateExpression: 'set #name = :name, email = :email, age = :age, message = :message',
        ExpressionAttributeNames: {
            '#name': 'name'
        },
        ExpressionAttributeValues: {
            ':name' : name,
            ':email': email,
            ':age': age,
            ':message' : message
        }
    };

    try {
        await dynamodb.update(params).promise();
    } catch (err) {
        console.error(err);
        throw new Error('Error updating application');
    }
}

export async function getApplication(id) {
    const params = {
        TableName: database_name,
        Key: {id}
    };

    try {
        const result = await dynamodb.get(params).promise();
        if(!result.Item) {
            throw new Error('Application not found');
        }
        return result.Item;

    } catch (err) {
        console.error(err);
        throw new Error('Error retrieving application');
    }
}

export async function getAllApplications() {
    const params = {
        TableName: database_name
    };

    try {
        const result = await dynamodb.scan(params).promise();
        return result.Items;

    } catch (err) {
        console.error(err);
        throw new Error('Error retrieving applications');
    }
}

export async function deleteApplication(id) {
    const params = {
        TableName: database_name,
        Key: {id}
    };

    try {
        await dynamodb.delete(params).promise();
        
    } catch (err) {
        console.error(err);
        throw new Error('Error deleting applications');
    }
}