import * as cdk from 'aws-cdk-lib';
import { OidcStack } from '../lib/oidc-stack';

const app = new cdk.App();
new OidcStack(app, 'ContrailOidcStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-west-2',
  },
});
app.synth();
