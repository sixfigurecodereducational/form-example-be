import * as cdk from 'aws-cdk-lib';
import iam from 'aws-cdk-lib/aws-iam';
import dynamodb from "aws-cdk-lib/aws-dynamodb";
import lambda from "aws-cdk-lib/aws-lambda";
import apigateway from "aws-cdk-lib/aws-apigateway";
import path from "path";

export default class JobApplicationsStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const jobApplicationsLambdaRole = new iam.Role(
      this,
      "JobApplicationsLambdaRole",
      {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        description: "Job Applications Lambda Role.",
      }
    );

    jobApplicationsLambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    jobApplicationsLambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaVPCAccessExecutionRole"
      )
    );

    jobApplicationsLambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "AmazonDynamoDBFullAccess"
      )
    );

    const jobApplicationsDynamoDB = new dynamodb.Table(this, "JobApplicationsDynamoDBTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING }
    });

    const jobApplicationsLambda = new lambda.Function(this, "JobApplicationsLambda", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      role: jobApplicationsLambdaRole,
      code: lambda.Code.fromAsset(path.join(path.resolve(), 'dist')),
      environment: {
        DYNAMO_TABLE_NAME: jobApplicationsDynamoDB.tableName
      }
    });

    const jobApplicationsRestAPI = new apigateway.LambdaRestApi(this, "JobApplicationsAPI", {
      restApiName: 'JobApplicationsAPI',
      handler: jobApplicationsLambda,
      defaultCorsPreflightOptions: {
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowOrigins: ['http://localhost:3000', 'https://form-example-beryl.vercel.app', 'https://form-example-git-main-sixfigurecodereducational.vercel.app', 'https://form-example-sixfigurecodereducational.vercel.app'],
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS.concat(['X-Api-Key']),
        allowCredentials: true
      }
    });


    const jobApplicationAPIKey = new apigateway.ApiKey(this, 'JobApplicationsAPIKey', {
      apiKeyName: 'JobApplicationsAPIKey'
    });

    new apigateway.UsagePlan(this, 'JobApplicationsUsagePlan', {
      name: 'JobApplicationsUsagePlan',
      apiKey: jobApplicationAPIKey,
      apiStages: [
        {
          api: jobApplicationsRestAPI,
          stage: jobApplicationsRestAPI.deploymentStage
        }
      ]
    });

    new cdk.CfnOutput(this, 'JobApplicationsApiKey', {
      value: jobApplicationAPIKey.keyId
    });
  }
}

