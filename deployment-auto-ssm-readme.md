# Manual CloudFormation Deployment - Automatic SSM Updates

This testing deployment does not require manual `aws ssm put-parameter` commands.

## Stack responsibility

| Stack | What it creates | What it writes to SSM |
|---|---|---|
| `blog.yaml` | Blog S3 buckets and Lambda functions | `/portfolio/blog/fetch-post-function-arn`, `/portfolio/blog/fetch-post-function-name` |
| `viewcounter.yaml` | DynamoDB table and Lambda | `/portfolio/viewcounter/function-arn`, `/portfolio/viewcounter/function-name` |
| `contactform-updated-v3.yaml` | SNS topic and contact Lambda | `/portfolio/contactform/function-arn`, `/portfolio/contactform/function-name` |
| `awslatestnews-updated-v3.yaml` | News table and Lambdas | `/portfolio/awslatestnews/function-arn`, `/portfolio/awslatestnews/function-name` |
| `http-api-auto-ssm-v4.yaml` | HTTP API routes | `/portfolio/blog/api-url`, `/portfolio/viewcounter/api-url`, `/portfolio/contact/api-url`, `/portfolio/news/api-url` |
| `vpc-auto-ssm.yaml` | VPC, subnets, IGW, NAT | `/portfolio/network/vpc-id`, `/portfolio/network/public-subnet-ids`, `/portfolio/network/private-subnet-ids` |
| `alb.yaml` | ALB, listener, target group | `/portfolio/alb/security-group-id`, `/portfolio/alb/dns-name`, `/portfolio/alb/web-target-group-arn` |
| `asg-web.yaml` | Private EC2 Auto Scaling Group | Reads API URL parameters and generates `/var/www/html/config.js` |

## Important note

If you previously created any of these parameters manually, delete them before deploying the stack that owns them. `AWS::SSM::Parameter` cannot adopt an existing parameter that was created outside the stack.

Example cleanup only if needed:

```bash
aws ssm delete-parameters \
  --names \
    /portfolio/blog/api-url \
    /portfolio/viewcounter/api-url \
    /portfolio/contact/api-url \
    /portfolio/news/api-url \
    /portfolio/network/vpc-id \
    /portfolio/network/public-subnet-ids \
    /portfolio/network/private-subnet-ids \
  --region us-east-1
```

## Deployment order

### 1. Backend service stacks

```bash
aws cloudformation deploy \
  --template-file blog.yaml \
  --stack-name portfolio-blog \
  --region us-east-1 \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    UploadObjectsBucketName=upload-bucket-jlojo \
    TransformedObjectsBucketName=transform-bucket-ljoi
```

```bash
aws cloudformation deploy \
  --template-file viewcounter.yaml \
  --stack-name portfolio-viewcounter \
  --region us-east-1 \
  --capabilities CAPABILITY_NAMED_IAM
```

```bash
aws cloudformation deploy \
  --template-file contactform-updated-v3.yaml \
  --stack-name portfolio-contact \
  --region us-east-1 \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides ContactEmail=kleb.dorelien@gmail.com
```

```bash
aws cloudformation deploy \
  --template-file awslatestnews-updated-v3.yaml \
  --stack-name portfolio-news \
  --region us-east-1 \
  --capabilities CAPABILITY_NAMED_IAM
```

### 2. HTTP API stack

This creates API Gateway and automatically writes the API URLs to SSM.

```bash
aws cloudformation deploy \
  --template-file http-api-auto-ssm-v4.yaml \
  --stack-name portfolio-http-api \
  --region us-east-1
```

Verify:

```bash
aws ssm get-parameters \
  --names \
    /portfolio/blog/api-url \
    /portfolio/viewcounter/api-url \
    /portfolio/contact/api-url \
    /portfolio/news/api-url \
  --region us-east-1
```

### 3. VPC stack

This creates the VPC and automatically writes network IDs to SSM.

```bash
aws cloudformation deploy \
  --template-file vpc-auto-ssm.yaml \
  --stack-name portfolio-vpc \
  --region us-east-1
```

Verify:

```bash
aws ssm get-parameters \
  --names \
    /portfolio/network/vpc-id \
    /portfolio/network/public-subnet-ids \
    /portfolio/network/private-subnet-ids \
  --region us-east-1
```

### 4. ALB stack

```bash
aws cloudformation deploy \
  --template-file alb-ssm-string-fix.yaml \
  --stack-name portfolio-alb \
  --region us-east-1 \
  --parameter-overrides CertificateArn=arn:aws:acm:us-east-1:843553758024:certificate/b15aab5c-0adb-4724-8f7d-6d70f8ebecf3
```

### 5. ASG web stack

```bash
aws cloudformation deploy \
  --template-file asg-web-ssm-string-fix.yaml \
  --stack-name portfolio-web-asg \
  --region us-east-1 \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides PrivateAmiId=ami-05a9d6a7c5d03d105
```

### 6. CloudFront and Route 53
## https fix using updated stack
## #################
aws cloudformation deploy \
  --template-file cloudfront-route53-production-https.yaml \
  --stack-name portfolio-cloudfront-route53 \
  --region us-east-1 \
  --parameter-overrides \
    WebsiteDomainName=portfolio.homenub.com \
    AlbOriginDomainName=alb.homenub.com \
    HostedZoneId=Z00414272K7YBCYJ3PEG4 \
    CloudFrontCertificateArn=arn:aws:acm:us-east-1:843553758024:certificate/b15aab5c-0adb-4724-8f7d-6d70f8ebecf3

## ################

## test
curl -I https://alb.homenub.com
curl -I https://portfolio.homenub.com

## Test generated config.js

After EC2 instances launch:

```bash
aws ssm start-session --target YOUR_INSTANCE_ID --region us-east-1
```

Then on the instance:

```bash
sudo cat /var/www/html/config.js
sudo /usr/local/bin/update-portfolio-config.sh
sudo cat /var/www/html/config.js
```

Challenge:
Auto Scaling Group instance refreshes were not picking up UserData changes.

Root Cause:
The ASG was configured to use an older Launch Template version.

Resolution:
Updated the ASG to use the latest Launch Template version and performed an instance refresh, allowing new instances to execute the updated UserData and install the CodeDeploy agent successfully.


The project uses separate CI/CD pipelines for frontend delivery and infrastructure validation/deployment. Website updates are deployed automatically to EC2 instances in an Auto Scaling Group through CodeDeploy. Infrastructure templates are validated through CodeBuild, then promoted through approval-gated CloudFormation deployment stages.


All runtime configuration and deployment parameters are centrally managed through AWS Systems Manager Parameter Store and consumed by CloudFormation, EC2 UserData, Lambda functions, and CI/CD pipelines.

## Final architecture

aws-serverless-portfolio-platform
│
├── website/
│   ├── index.html
│   ├── blog.html
│   ├── aws.html
│   └── ...
│
├── cloudformation/
│   ├── vpc.yaml
│   ├── alb.yaml
│   ├── asg.yaml
│   ├── blog.yaml
│   ├── viewcounter.yaml
│   └── ...
│
├── buildspec.yml
├── buildspec-infra-validate.yml
└── buildspec-infra-deploy-backend.yml