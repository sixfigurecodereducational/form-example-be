import * as cdk from 'aws-cdk-lib';
import JobApplicationsStack from '../lib/job-applications-stack.js';
import dotenv from 'dotenv';
dotenv.config();


const app = new cdk.App();

new JobApplicationsStack(app, 'JobApplicationsStack', {
  env: {
    region: 'us-east-1',
    account: process.env.CDK_DEFAULT_ACCOUNT
  }
})



