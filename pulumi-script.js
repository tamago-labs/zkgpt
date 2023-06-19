"use strict";
const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");
const awsx = require("@pulumi/awsx");

const cluster = new aws.ecs.Cluster("cluster", {});

const lb = new awsx.lb.ApplicationLoadBalancer("lb-zkgpt", { listener: { port: 8000 },  defaultTargetGroup: { port: 8000, deregistrationDelay: 0 } });

const service = new awsx.ecs.FargateService("service", {
    cluster: cluster.arn,
    assignPublicIp: true,
    desiredCount: 1,
    taskDefinitionArgs: {
        containers: {
            "zkgpt": {
                image: "pisuthd/zkgpt:latest",
                essential: true,
                portMappings: [
                    {
                        targetGroup: lb.defaultTargetGroup,
                    }
                ],
                memory: 2048,
                environment: [
                    {
                        "name": "OPENAI_API_KEY",
                        "value": "YOUR_API_KEY",
                    }
                ]
            },
        },
    }
});

// Export the load balancer's address so that it's easy to access.
exports.GptNodeUrl = lb.loadBalancer.dnsName