# Highly Available Web Architecture with ALB Advanced Routing

This project demonstrates a production style AWS architecture that implements advanced request routing using an Application Load Balancer (ALB). This environment was deployed using AWS CloudFormation and showcase a design that follow AWS Well-Architected Framework and prescriptive guidances. 

The solution uses host-based routing to support multiple domains behind a single load balancer. Incoming requests are evaluated using the HTTP host header, allowing the ALB to route traffic to different target groups and EC2 Auto Scaling Groups depending on the requested domain.

In addition to host routing, the architecture implements path-based routing (URL-based routing). ALB listener rules inspect the request path and forward traffic to the appropriate backend service based on defined routing patterns. This enables multiple applications or services to share a single load balancer entry point while maintaining clear traffic segmentation.

To demonstrate scalable infrastructure design, the project integrates EC2 Auto Scaling Groups with target tracking policies that scale compute resources dynamically based on the ALBRequestCountPerTarget metric. This ensures the environment can automatically adjust capacity in response to traffic demand.

Using the AWS Well-Architected Framework as my guide, I chose to host the static website for this project on S3 and integrated it with the other AWS services mentioned below to build a secure, scalable, and highly available solution.

## Overview

Key AWS services I used in this project include:
-   Virtual Private Cloud (VPC) for deploying resources in a private network environment
-   AWS Application Load Balancer (ALB) for intelligent traffic routing
-   Amazon EC2 Auto Scaling for dynamic horizontal scaling
-   Amazon Route 53 DNS integration for DNS management and domain routing
-   AWS Certificate Manager (ACM) for HTTPS/TLS certificate management
-   Amazon S3 for static website hosting and content storage
-   Multi-AZ networking architecture for high availability
-   AWS CloudFormation for automated infrastructure deployment

[![Architecture Diagram](images/Path%20Based%20Routing%20Diagram.png)](#)

## Auto Scaling Validation

Each Auto Scaling Group uses:

-   Metric: ALBRequestCountPerTarget
-   Target Value: 50 requests per target
-   Instance Warmup: 300 seconds
-   Min: 1
-   Max: 3

To trigger Auto Scaling events, I had to perform a load test against the Red endpoint. The command that I used generated repeated HTTPS requests to the Application Load Balancer, increasing the ALBRequestCountPerTarget metric used by the scaling policy.


for i in {1..1000}; do
  curl -sk -o /dev/null -w "%{http_code}\n" https://red.homenub.com/red/index.html
done


This sustained request volume triggered CloudWatch alarms and caused the Auto Scaling Group to scale out automatically.

[![ASG Activity](images/ASG%20activity%20history.png)](#)


## Host-Based Routing Validation

Traffic routed correctly based on host headers:

-   https://red.homenub.com → Red Target Group
-   https://blue.homenub.com → Blue Target Group

### Red Environment

[![Red Host](images/host%20based%20red.png)](#)

### Blue Environment

[![Blue Host](images/host%20based%20blue.png)](#)


## Path-Based Routing Validation

Routing rules:

-   /red\* → Red Target Group
-   /blue\* → Blue Target Group

### Red Path

[![Red Path](images/path%20based%20red.png)](#)

### Blue Path

[![Blue Path](images/path%20based%20blue.png)](#)

### Listener Rules 

[![Listener Rules](images/listener-rules.png)](#)



## Target Groups & Load Balancer

[![Target Groups](images/target-groups.png)](#)


Traffic is distributed across multiple Availability Zones with private
EC2 instances deployed behind the Application Load Balancer.


## Architecture Highlights

This environment demonstrates:

-   Secure multi-AZ architecture
-   HTTPS termination using ACM
-   Route 53 DNS integration
-   Dynamic scaling based on real traffic metrics
-   Modular nested CloudFormation stacks



## Lessons I Learned

1.  Target tracking requires sustained load, not burst traffic.
2.  Listener rule priority directly impacts routing behavior.
3.  Instance warmup settings help prevent scaling instability.
4.  Nested CloudFormation stacks improve re-usability and scalability but require careful parameter management
5.  Always validate CloudFormation templates before deployment.



## Production Enhancements I would like to make

-   Add AWS WAF for enhanced security
-   Enable ALB access logs for monitoring and analysis
-   Add CloudFront in front of ALB for edge caching and improved performance
-   Add a database tier (e.g Amazon RDS) to support dynamic application workloads
