# AWS Portfolio Website Deployment Guide

This project deploys the network and web-hosting layer for the AWS portfolio website shown in the architecture diagram. The design keeps the public entry points at CloudFront and the Application Load Balancer, while the EC2 web servers run inside private subnets across two Availability Zones.

## Architecture Summary

The website uses this flow:

```text
User
  -> Route 53: homenub.com
  -> CloudFront
  -> Public Application Load Balancer
  -> EC2 Auto Scaling Group in private subnets
  -> JavaScript frontend calls API Gateway routes
  -> Lambda backend services
```

The frontend no longer hardcodes API Gateway URLs inside `blog.js`, `index.js`, or `aws.js`. Instead, all frontend JavaScript reads from `config.js`:

```javascript
window.APP_CONFIG = {
  BLOG_API_URL: "...",
  VIEW_COUNTER_API_URL: "...",
  CONTACT_API_URL: "...",
  NEWS_API_URL: "..."
};
```

The ASG user data creates and refreshes `/var/www/html/config.js` by pulling these values from SSM Parameter Store:

```text
/portfolio/blog/api-url
/portfolio/viewcounter/api-url
/portfolio/contact/api-url
/portfolio/news/api-url
```

## Important Design Notes

The Auto Scaling Group spans two Availability Zones in one AWS Region, not two AWS Regions. This matches the diagram pattern with `us-east-1a` and `us-east-1b` private subnets.

CloudFront requires its ACM certificate to be in `us-east-1`. The ALB certificate must be in the same Region as the ALB. If the whole environment is deployed in `us-east-1`, the same certificate can cover both, assuming it includes `homenub.com`.

## Files Included

| File | Purpose |
|---|---|
| `vpc.yaml` | Creates VPC, 2 public subnets, 2 private subnets, Internet Gateway, NAT Gateway, and SSM network parameters. |
| `alb.yaml` | Creates the internet-facing ALB, HTTPS listener, target group, and SSM ALB parameters. |
| `asg-web.yaml` | Creates private EC2 web servers using your private AMI, an ASG across two private subnets, instance role, and generated `config.js`. |
| `cloudfront-route53.yaml` | Creates CloudFront distribution and Route 53 alias records for `homenub.com`. |
| `config.js` | Local placeholder config file. The running EC2 instances generate the real version from SSM. |
| `index-config-updated.js` | Updated home page JavaScript using `window.APP_CONFIG`. |
| `blog-config-updated.js` | Updated blog JavaScript using `window.APP_CONFIG`. |
| `aws-config-updated.js` | Updated AWS News JavaScript using `window.APP_CONFIG`. |

## Deployment Prerequisites

Before deploying these stacks, confirm the following:

1. You have a Route 53 public hosted zone for `homenub.com`.
2. You have an ACM certificate for `homenub.com`.
3. The CloudFront certificate exists in `us-east-1`.
4. Your private AMI already contains the website files and web server software, or the ASG user data can install/start Apache successfully.
5. Your backend stacks have already written these SSM parameters:

```bash
aws ssm get-parameters \
  --names \
    /portfolio/blog/api-url \
    /portfolio/viewcounter/api-url \
    /portfolio/contact/api-url \
    /portfolio/news/api-url
```

If any of these are missing, update your backend CloudFormation stacks first.

## Step 1: Deploy the VPC Stack

```bash
aws cloudformation deploy \
  --template-file vpc.yaml \
  --stack-name portfolio-vpc \
  --region us-east-1
```

Verify the network parameters:

```bash
aws ssm get-parameters \
  --names \
    /portfolio/network/vpc-id \
    /portfolio/network/public-subnet-ids \
    /portfolio/network/private-subnet-ids \
  --region us-east-1
```

## Step 2: Deploy the ALB Stack

Replace the certificate ARN with your ACM certificate ARN.

```bash
aws cloudformation deploy \
  --template-file alb.yaml \
  --stack-name portfolio-alb \
  --region us-east-1 \
  --parameter-overrides \
    CertificateArn=arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERTIFICATE_ID
```

Verify the ALB parameters:

```bash
aws ssm get-parameters \
  --names \
    /portfolio/alb/security-group-id \
    /portfolio/alb/dns-name \
    /portfolio/alb/web-target-group-arn \
  --region us-east-1
```

## Step 3: Deploy the Web ASG Stack

Replace the AMI ID with your private AMI ID.

```bash
aws cloudformation deploy \
  --template-file asg-web.yaml \
  --stack-name portfolio-web-asg \
  --region us-east-1 \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    PrivateAmiId=ami-xxxxxxxxxxxxxxxxx
```

The instances launch in private subnets and register with the ALB target group.

Check target health:

```bash
aws elbv2 describe-target-health \
  --target-group-arn $(aws ssm get-parameter \
    --name /portfolio/alb/web-target-group-arn \
    --query 'Parameter.Value' \
    --output text \
    --region us-east-1) \
  --region us-east-1
```

## Step 4: Deploy CloudFront and Route 53

Find your hosted zone ID:

```bash
aws route53 list-hosted-zones-by-name \
  --dns-name homenub.com \
  --query 'HostedZones[0].Id' \
  --output text
```

Deploy CloudFront and DNS:

```bash
aws cloudformation deploy \
  --template-file cloudfront-route53.yaml \
  --stack-name portfolio-cloudfront-route53 \
  --region us-east-1 \
  --parameter-overrides \
    DomainName=homenub.com \
    HostedZoneId=Z123456789ABCDEFG \
    CloudFrontCertificateArn=arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERTIFICATE_ID
```

## Step 5: Update Frontend Files in the Private AMI or Deployment Pipeline

Replace the existing JavaScript files with these updated versions:

```text
index-config-updated.js -> index.js
blog-config-updated.js  -> blog.js
aws-config-updated.js   -> aws.js
```

Make sure each HTML page loads `config.js` before the page-specific JavaScript:

```html
<script src="script.js"></script>
<script src="config.js"></script>
<script src="index.js"></script>
```

For a real CI/CD setup, do not bake changing API URLs into the AMI. Let CodeBuild or EC2 user data generate `config.js` from SSM Parameter Store.

## Step 6: Test the Website

Test the ALB first:

```bash
ALB_DNS=$(aws ssm get-parameter \
  --name /portfolio/alb/dns-name \
  --query 'Parameter.Value' \
  --output text \
  --region us-east-1)

curl -I https://$ALB_DNS
```

Then test the custom domain:

```bash
curl -I https://homenub.com
```

Open the browser developer console and confirm:

```javascript
window.APP_CONFIG
```

You should see the API URLs loaded from `config.js`.

## Recommended Production Improvement

The best long-term pattern is:

```text
CloudFormation deploys backend APIs
CloudFormation writes API URLs to SSM
CodePipeline runs CodeBuild
CodeBuild generates config.js from SSM
CodeDeploy pushes website files to the EC2 ASG
CloudFront serves homenub.com
```

That keeps infrastructure, frontend code, and runtime configuration cleanly separated.
