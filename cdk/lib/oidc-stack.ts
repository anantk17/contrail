import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { config } from './config';

export class OidcStack extends cdk.Stack {
  public readonly githubActionsRole: iam.Role;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const provider = new iam.OpenIdConnectProvider(this, 'GitHubOidcProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    this.githubActionsRole = new iam.Role(this, 'GitHubActionsRole', {
      roleName: 'contrail-github-actions-role',
      assumedBy: new iam.WebIdentityPrincipal(provider.openIdConnectProviderArn, {
        StringEquals: {
          'token.actions.githubusercontent.com:sub':
            `repo:${config.githubOrg}/${config.githubRepo}:ref:refs/heads/main`,
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
        },
      }),
    });

    // Allows CDK deploy to work — same permission cli-user has
    this.githubActionsRole.addToPolicy(new iam.PolicyStatement({
      actions: ['sts:AssumeRole'],
      resources: [`arn:aws:iam::${config.awsAccountId}:role/cdk-*`],
    }));

    new cdk.CfnOutput(this, 'GitHubActionsRoleArn', {
      value: this.githubActionsRole.roleArn,
      exportName: 'ContrailGitHubActionsRoleArn',
    });
  }
}