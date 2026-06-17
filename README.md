# AWS Serverless Portfolio Platform

## Overview

This project demonstrates the migration of a traditional single server website to a highly available, scalable, secure, and partially serverless AWS architecture. The solution uses Amazon CloudFront, Route 53, an Application Load Balancer (ALB), and an Auto Scaling Group (ASG) to provide resilient traffic routing and automatic scaling across multiple Availability Zones. User requests are routed through CloudFront and the ALB to EC2 instances running in private subnets, improving availability while preventing direct internet access to the web servers.

Security, automation, and operational visibility were key design goals. Access is controlled using least privilege security groups, while backend services leverage Amazon API Gateway, AWS Lambda, DynamoDB, S3, and SNS. Infrastructure is deployed using CloudFormation and CI/CD pipelines, and a centralized CloudWatch Dashboard provides visibility into application health and performance. The result is a production style AWS environment that showcases cloud architecture, Infrastructure as Code, automation, monitoring, troubleshooting, and security best practices.


## Architecture

```text

aws-serverless-portfolio-platform
│
├── website/
│   ├── index.html
│   ├── blog.html
│   ├── aws.html
│   ├── certs.html
│   ├── config.js
│   ├── index.js
│   ├── blog.js
│   ├── aws.js
│   └── style.css
│
├── cloudformation/
│   ├── vpc-auto-ssm.yaml
│   ├── alb-ssm-string-fix.yaml
│   ├── asg-web-ssm-string-fix.yaml
│   ├── blog.yaml
│   ├── viewcounter.yaml
│   ├── contactform-updated-v3.yaml
│   ├── awslatestnews-updated-v3.yaml
│   ├── http-api-auto-ssm-v4.yaml
│   ├── cloudfront-route53-production-https.yaml
│   ├── cloudwatch-dashboard.yaml
│   └── parameters/
│       ├── blog-params.json
│       └── contact-params.json
│
├── scripts/
│   └── clean_webroot.sh
│
├── appspec.yml
├── buildspec.yml
├── buildspec-infra-validate.yml
├── buildspec-infra-deploy-backend.yml
├── README.md
│
├── Website CI/CD Pipeline
│   └── GitHub → CodeBuild → CodeDeploy → EC2 Auto Scaling Group
│
└── Infrastructure CI/CD Pipeline
    └── GitHub → Validate → Create Change Set → Approval → Execute Change Set
```

## Screenshots

### Architecture Diagram
![Architecture Diagram](images/AWS-Portfolio-Website-Diagram.png)

### CloudWatch Dashboard
![CloudWatch Dashboard](images/cloudwatch-dashboard.png)

### Website CI/CD Pipeline
![Website Pipeline](images/website-pipeline.png)

### Infrastructure CI/CD Pipeline
![Infrastructure Pipeline](images/infra-pipeline.png)

### Website screenshots
![Website Home page](images/home-pg.png)
![Website blog page](images/blog.png)
![Website certs page](images/certs-pg.png)
![Website news page](images/news-pg.png)


## Business Problem

The original application relied on a single server and manual deployment processes. The objective was to redesign the platform using AWS services while introducing scalability, automation, monitoring, and deployment controls.

## Solution Highlights

- CloudFront + Route 53 for global content delivery
- Application Load Balancer for intelligent traffic routing
- Amazon EC2 Auto Scaling Group for dynamic horizontal scaling 
- Serverless backend services using Lambda and API Gateway
- SSM Parameter Store for centralized configuration
- CloudFormation Infrastructure as Code
- GitHub → CodePipeline → CodeBuild → CodeDeploy automation
- CloudFormation Change Sets with approval workflow
- CloudWatch Dashboard for operational monitoring

## Dynamic Configuration Design

Instead of hardcoding API URLs in JavaScript, the website loads configuration from config.js.

The Auto Scaling Group UserData script generates config.js dynamically using values stored in Systems Manager Parameter Store.

Benefits:

- No manual API URL updates
- Consistent configuration across environments
- Easier maintenance
- Reduced deployment risk

## CI/CD Pipelines

### Website Pipeline

GitHub → CodeBuild → CodeDeploy → Auto Scaling Group

Purpose:

- Deploy website content
- Update HTML, CSS, JavaScript
- Preserve infrastructure

### Infrastructure Pipeline

GitHub → Validate → Create Change Set → Manual Approval → Execute Change Set

Purpose:

- Validate CloudFormation templates
- Review infrastructure modifications
- Deploy backend services safely

## Lessons Learned

Building this project provided valuable hands on experience with AWS architecture, automation, troubleshooting, and operational monitoring. Below are a few of the key lessons I learned while designing, deploying, and supporting the solution.

* **Auto Scaling Group Not Using Updated UserData**

One issue I encountered was updating my UserData script but not seeing the changes applied to newly launched EC2 instances. After troubleshooting, I discovered that the Auto Scaling Group was still using a previous launch template version.

The solution was to update the Auto Scaling Group to use the latest launch template version and perform an instance refresh.

**Lesson Learned:** Updating a launch template does not automatically update an Auto Scaling Group. It is important to verify which launch template version the ASG is using when troubleshooting instance configuration issues.

---

* **Dynamic Configuration with Parameter Store**

I initially hardcoded API Gateway endpoints directly into my JavaScript files. As the project grew and API endpoints changed, maintaining those URLs became difficult and required unnecessary code updates.

To simplify configuration management, I moved the endpoint values into AWS Systems Manager Parameter Store and generated a dynamic `config.js` file during instance startup.

**Lesson Learned:** Separating configuration from application code makes deployments easier, reduces manual updates, and provides a more scalable solution for managing environment specific settings.

---

* **CloudFront Caching and Content Updates**

During website deployments, I occasionally noticed that recent changes were not immediately visible even though the deployment completed successfully. After investigating, I found that CloudFront was serving cached content instead of the latest website files.

The solution was to create CloudFront invalidations after deployments to force CloudFront to refresh cached objects.

**Lesson Learned:** Successful deployments do not always guarantee users will immediately see updated content. Understanding how CloudFront caching works is essential for troubleshooting website updates and ensuring users receive the latest version of the application.


## CloudWatch Dashboard

As I worked through various deployment and troubleshooting challenges, I realized the project lacked a centralized view of the application's overall health and performance. To improve operational visibility and simplify troubleshooting, I implemented a CloudWatch Dashboard that consolidates key metrics across the platform's core AWS services.

### Metrics Monitored

* Application Load Balancer (ALB) Requests
* EC2 CPU Utilization
* Lambda Errors and Invocations
* API Gateway Requests
* CloudFront Requests

### Why It Matters

Many portfolio projects focus primarily on infrastructure deployment and automation. However, operating and supporting an application after deployment is equally important. This dashboard provides a centralized view of system health, performance, and traffic patterns, enabling faster troubleshooting and root cause analysis when issues occur.

As a Sr. IT Analyst, much of my day-to-day work involves monitoring systems, investigating incidents, and performing root cause analysis. Adding the CloudWatch Dashboard allowed me to apply that same operational mindset to this project while demonstrating how observability and monitoring are critical components of a production ready cloud environment.


## Skills Demonstrated

- AWS CloudFormation
- EC2 Auto Scaling
- Application Load Balancer
- CloudFront
- Route 53
- Lambda
- API Gateway
- DynamoDB
- Systems Manager Parameter Store
- CloudWatch
- CodePipeline
- CodeBuild
- CodeDeploy
- Infrastructure as Code
- Change Management
- Monitoring and Troubleshooting


## Future Enhancements

These are a few of the enhancements I would like to add in a future iteration of the project.

* **CloudWatch Alarms & SNS Notifications** – Add automated alerts for critical application and infrastructure events.

* **AWS WAF Integration** – Protect the application from common web attacks and malicious traffic.

* **Multi-Region Deployment** – Improve resiliency and disaster recovery by deploying the solution to an additional AWS Region.


