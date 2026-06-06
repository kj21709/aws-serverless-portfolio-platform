
# SAA1 Capstone Project 1: AWS Portfolio Website

## Overview and Objectives

**Project Overview:**

Welcome to the capstone project on building a server-based resume (CV) and AWS Latest News website. When completed, you should have a website built using several AWS technologies that demonstrate your skills as an AWS architect and engineer.

In this capstone, you will follow structured steps as you develop and deploy the solution. Setup instructions are detailed in the **Prerequisite and Setup** section below.

> **Note:** If you need any help or assistance while attempting this capstone, see the Help section at the bottom for guidance.

---

## Project Brief

The customer, a start-up known as ExampleCorp, is migrating their AWS Portfolio website into the cloud. They have been running this application as a monolithic app for the past ten years, hosted on a single server in their head office.

Due to performance issues, high operating costs, and mounting technical debt, ExampleCorp has decided to migrate this application to AWS. The current application architecture results in downtime during updates and poses risks due to its tightly coupled design.

The internal development team has decoupled the application into:

- Frontend website files (HTML, CSS, JavaScript)
- Microservices (AWS Latest News, Blog Post service, View Counter, and Contact Form)
- Each microservice is packaged in its own CloudFormation template
- The website is available as a pre-built Amazon Machine Image (AMI)

Your role as the migration lead is to:

1. Deploy the EC2-based website and integrate the microservices.
2. Migrate the entire application to a serverless model to reduce cost and increase agility.

---

## Project Stages

### Stage 1 - Server-Based Highly Available Website

**Objectives:**

- Deploy the EC2 application using the provided AMI
- Ensure scalability and high availability using ALB, Auto Scaling, CloudFront, and Route 53
- Integrate microservices via Lambda, S3, and Function URLs
- Apply security best practices (no public IPs on EC2, least privilege IAM, Security Groups)

### Stage 2 - Serverless Infrastructure Migration

**Objectives:**

- Host the website as a static site using Amazon S3
- Configure a CloudFront distribution with a custom domain
- Update Route 53 DNS records to reflect the new architecture

---

## Team or Individual Approach

### Team-Based:

- Encourages collaboration, shared learning, and diversified skills
- Requires coordination, shared accountability, and communication

### Individual:

- Promotes independence, personalized learning, and full project ownership
- Requires time management, troubleshooting skills, and initiative

---

## Documentation Recommendation

Document your development and deployment journey. Consider publishing articles or project breakdowns on LinkedIn or Medium to build your professional portfolio.

---

## Prerequisites and Setup

> **Region Requirement:** us-east-1 (N. Virginia)

### Step 1 - Deploy the EC2 Instance

1. Search for and launch one of the following Community AMIs:
   - `ami-0187c13375421d49b`
   - `ami-0ad30595ed9352391`

2. SSH into your instance and navigate to `/var/www/html`. You should find:
   - `index.html`, `index.js`
   - `blog.html`, `blog.js`
   - `aws.html`, `aws.js`
   - `certs.html`
   - `style.css`
   - `architectassociate.png`, `cloudpractitioner.png`

3. View your page via the public IP to verify it's running.

### Customizing `certs.html`

To add your own certifications:

```bash
nano certs.html
```

Copy and customize this snippet:

```html
<div class="certification">
    <img src="azure-fundamental.png" alt="AWS Cloud Practitioner Badge" class="certification-badge">
    <h3 class="certification-title">AWS Certified Cloud Practitioner</h3>
</div>
```

## devops cert file name: aws-certified-developer-associate-badge.png

For each certification:

- Upload badge to S3
- Use IAM permissions to allow EC2 to access S3
- Copy files to EC2 using:

```bash
aws s3 cp s3://your-bucket-name/your-image.png /var/www/html/
```

Then refresh the browser using **Ctrl + Shift + R** to verify changes.

---

### Step 2 - Deploy CloudFormation Microservices

Use these templates (deploy in any order):

#### Blog Microservice

**Template:** [blog.yaml](https://cloud-mastery-bootcamp.s3.amazonaws.com/capstones/saa-capstone-1-cf-templates/blog.yaml)

- Create HTTP API (GET) for `FetchPostFunction` Lambda with CORS:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: *
Access-Control-Allow-Methods: *
Access-Control-Expose-Headers: *
```

- Add API URL to `blog.js` (line 6)
- Add S3 `.txt` upload trigger for `CreatePostFunction`

#### View Counter

**Template:** [viewcounter.yaml](https://cloud-mastery-bootcamp.s3.amazonaws.com/capstones/saa-capstone-1-cf-templates/viewcounter.yaml)

- Create Function URL (auth = NONE, CORS enabled)
- Add URL to `index.js` (line 3)

#### Contact Form

**Template:** [contactform.yaml](https://cloud-mastery-bootcamp.s3.amazonaws.com/capstones/saa-capstone-1-cf-templates/contactform.yaml)

- Create Function URL (auth = NONE, CORS enabled)
- Update `index.js` (line 34)

#### AWS Latest News

**Template:** [awslatestnews.yaml](https://cloud-mastery-bootcamp.s3.amazonaws.com/capstones/saa-capstone-1-cf-templates/awslatestnews.yaml)

- Use Function URL for `UpdateWebpageFunction`
- Add to `aws.js` (line 2)
- Run RSS Lambda manually to populate DynamoDB

---

### Step 3 - Finalize and Test

- Test functionality using browser dev tools or `curl`
- Create a new AMI for reuse in scaling and automation
- Use AMI in Launch Template or Auto Scaling Group

> ⚠️ Deleting CloudFormation stacks breaks API links — reinsert updated URLs if needed.

---

### Step 4 - Build Network Architecture

- Custom VPC
- Public/Private Subnets
- Internet Gateway, NAT Gateway
- Application Load Balancer (HTTPS)
- Auto Scaling Group
- CloudFront
- Route 53 with custom domain

> _Reference diagram to be inserted or linked here_

---#######################################################################################

### Step 5 - Migrate to Serverless

1. Upload files to S3 bucket (static website hosting enabled)
2. Configure CloudFront with ACM certificate
3. Point Route 53 records to CloudFront

---

## Assistance & Getting Help

Use Slack for support.

---

## Additional Challenge

Try creating a REST API with multiple resources and methods instead of using separate Function URLs for each microservice.

---

## Final Deliverables Checklist

| Deliverable                 | Description                                         | Complete? |
|----------------------------|-----------------------------------------------------|-----------|
| EC2 website deployed       | AMI launched and reachable                          | ☐         |
| ALB + Auto Scaling         | Deployed with Launch Template                       | ☐         |
| Blog microservice working  | API tested and integrated into `blog.js`           | ☐         |
| View counter live          | Lambda URL responding and in `index.js`            | ☐         |
| Contact form functional    | Lambda URL connected in `index.js`                 | ☐         |
| AWS news updates shown     | RSS feed integrated in `aws.js`                    | ☐         |
| S3 static website live     | Migrated, tested with CloudFront + Route 53        | ☐         |

---

## Tips for Troubleshooting

- Use Chrome Developer Tools (F12 > Network tab)
- Hard refresh with: _Right-click → Empty Cache and Hard Reload_
- Use `curl` or Postman to test endpoints

---
