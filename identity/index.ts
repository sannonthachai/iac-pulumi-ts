import * as aws from "@pulumi/aws"
import { config } from "./config"

// The managed policies EKS requires of nodegroups join a cluster.
const nodegroupManagedPolicyArns: string[] = [
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
    "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
]
const cloudwatchPolicyArns: string[] = [
    "arn:aws:iam::aws:policy/cloudwatchAdminPolicy",
] 
// Create the EKS cluster admins role.
const adminsIamRole = new aws.iam.Role(config.adminsIamRoleName, {
    name: config.adminsIamRoleName,
    assumeRolePolicy: aws.getCallerIdentity().then(id => 
        aws.iam.assumeRolePolicyForPrincipal({
            "AWS": [
                `arn:aws:iam::${id.accountId}:user/engineer`,
            ]
        }))
}, { deleteBeforeReplace: true})
new aws.iam.RolePolicy(config.adminsIamRolePolicyName, {
    name: config.adminsIamRolePolicyName,
    role: adminsIamRole,
    policy: {
        Version: "2012-10-17",
        Statement: [
            { Effect: "Allow", Action: ["eks:*", "ec2:DescribeImages"], Resource: "*", },
            { Effect: "Allow", Action: "iam:PassRole", Resource: "*"},
        ],
    },
},
    { 
        parent: adminsIamRole,
        deleteBeforeReplace: true,
    },
)
new aws.iam.RolePolicy(config.cloudwatchAdminPolicy, {
    name: config.cloudwatchAdminPolicy,
    role: adminsIamRole,
    policy: {
        Version: "2012-10-17",
        Statement: [
            {
                "Sid": "AllowReadingMetricsFromCloudWatch",
                "Effect": "Allow",
                "Action": [
                    "cloudwatch:DescribeAlarmsForMetric",
                    "cloudwatch:DescribeAlarmHistory",
                    "cloudwatch:DescribeAlarms",
                    "cloudwatch:ListMetrics",
                    "cloudwatch:GetMetricStatistics",
                    "cloudwatch:GetMetricData",
                    "cloudwatch:GetInsightRuleReport"
                ],
                "Resource": "*"
            },
            {
                "Sid": "AllowReadingLogsFromCloudWatch",
                "Effect": "Allow",
                "Action": [
                    "logs:DescribeLogGroups",
                    "logs:GetLogGroupFields",
                    "logs:StartQuery",
                    "logs:StopQuery",
                    "logs:GetQueryResults",
                    "logs:GetLogEvents"
                ],
                "Resource": "*"
            },
            {
                "Sid": "AllowReadingTagsInstancesRegionsFromEC2",
                "Effect": "Allow",
                "Action": ["ec2:DescribeTags", "ec2:DescribeInstances", "ec2:DescribeRegions"],
                "Resource": "*"
            },
            {
                "Sid": "AllowReadingResourcesForTags",
                "Effect": "Allow",
                "Action": "tag:GetResources",
                "Resource": "*"
            },
            {
                "Sid": "AllowReadingAcrossAccounts",
                "Effect": "Allow",
                "Action": [
                    "oam:ListSinks",
                    "oam:ListAttachedLinks"
                ],
                "Resource": "*"
            }
        ],
    },
},
    { 
        parent: adminsIamRole,
        deleteBeforeReplace: true,
    },
)
// Create the EKS cluster developers role.
const devsIamRole = new aws.iam.Role(config.devsIamRoleName, {
    name: config.devsIamRoleName,
    assumeRolePolicy: aws.getCallerIdentity().then(id => 
        aws.iam.assumeRolePolicyForPrincipal({
            "AWS": [
                `arn:aws:iam::${id.accountId}:root`,
            ]
        }))
}, { deleteBeforeReplace: true})
// Create the develop apps node group worker role and attach the required policies.
const developAppsNodegroupIamRole = new aws.iam.Role(config.developAppsNodeGroupIamRoleName, {
    name: config.developAppsNodeGroupIamRoleName,
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        "Service": "ec2.amazonaws.com"
    })
}, { deleteBeforeReplace: true})
attachPoliciesToRole(config.developAppsNodeGroupName, developAppsNodegroupIamRole, nodegroupManagedPolicyArns)
// Create the staging apps node group worker role and attach the required policies.
const stagingAppsNodegroupIamRole = new aws.iam.Role(config.stagingAppsNodeGroupIamRoleName, {
    name: config.stagingAppsNodeGroupIamRoleName,
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        "Service": "ec2.amazonaws.com"
    })
}, { deleteBeforeReplace: true})
attachPoliciesToRole(config.stagingAppsNodeGroupName, stagingAppsNodegroupIamRole, nodegroupManagedPolicyArns)
// Create the production develop apps node group worker role and attach the required policies.
const productionAppsNodegroupIamRole = new aws.iam.Role(config.productionAppsNodeGroupIamRoleName, {
    name: config.productionAppsNodeGroupIamRoleName,
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        "Service": "ec2.amazonaws.com"
    })
}, { deleteBeforeReplace: true})
attachPoliciesToRole(config.productionAppsNodeGroupName, productionAppsNodegroupIamRole, nodegroupManagedPolicyArns)
// Create the operations node group worker role and attach the required policies.
const operationsNodegroupIamRole = new aws.iam.Role(config.operationsNodeGroupIamRoleName, {
    name: config.operationsNodeGroupIamRoleName,
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        "Service": "ec2.amazonaws.com"
    })
}, { deleteBeforeReplace: true})
attachPoliciesToRole(config.operationsNodeGroupName, operationsNodegroupIamRole, nodegroupManagedPolicyArns)
// attachPoliciesToRole(config.operationsNodeGroupName, operationsNodegroupIamRole, cloudwatchPolicyArns)
new aws.iam.RolePolicy(config.cloudwatchPolicy, {
    name: config.cloudwatchPolicy,
    role: operationsNodegroupIamRole,
    policy: {
        Version: "2012-10-17",
        Statement: [
            {
                "Sid": "AllowReadingMetricsFromCloudWatch",
                "Effect": "Allow",
                "Action": [
                    "cloudwatch:DescribeAlarmsForMetric",
                    "cloudwatch:DescribeAlarmHistory",
                    "cloudwatch:DescribeAlarms",
                    "cloudwatch:ListMetrics",
                    "cloudwatch:GetMetricStatistics",
                    "cloudwatch:GetMetricData",
                    "cloudwatch:GetInsightRuleReport"
                ],
                "Resource": "*"
            },
            {
                "Sid": "AllowReadingLogsFromCloudWatch",
                "Effect": "Allow",
                "Action": [
                    "logs:DescribeLogGroups",
                    "logs:GetLogGroupFields",
                    "logs:StartQuery",
                    "logs:StopQuery",
                    "logs:GetQueryResults",
                    "logs:GetLogEvents"
                ],
                "Resource": "*"
            },
            {
                "Sid": "AllowReadingTagsInstancesRegionsFromEC2",
                "Effect": "Allow",
                "Action": ["ec2:DescribeTags", "ec2:DescribeInstances", "ec2:DescribeRegions"],
                "Resource": "*"
            },
            {
                "Sid": "AllowReadingResourcesForTags",
                "Effect": "Allow",
                "Action": "tag:GetResources",
                "Resource": "*"
            },
            {
                "Sid": "AllowReadingAcrossAccounts",
                "Effect": "Allow",
                "Action": [
                    "oam:ListSinks",
                    "oam:ListAttachedLinks"
                ],
                "Resource": "*"
            }
        ],
    },
},
    { 
        parent: operationsNodegroupIamRole,
        deleteBeforeReplace: true,
    },
)
// Create the pipeline node group worker role and attach the required policies.
const pipelineNodegroupIamRole = new aws.iam.Role(config.pipelineNodeGroupIamRoleName, {
    name: config.pipelineNodeGroupIamRoleName,
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        "Service": "ec2.amazonaws.com"
    })
}, { deleteBeforeReplace: true})
attachPoliciesToRole(config.pipelineNodeGroupName, pipelineNodegroupIamRole, nodegroupManagedPolicyArns)

export const adminsIamRoleArn = adminsIamRole.arn
export const devsIamRoleArn = devsIamRole.arn
export const developAppsNodegroupIamRoleArn = developAppsNodegroupIamRole.arn
export const stagingAppsNodegroupIamRoleArn = stagingAppsNodegroupIamRole.arn
export const productionAppsNodegroupIamRoleArn = productionAppsNodegroupIamRole.arn
export const operationsNodegroupIamRoleArn = operationsNodegroupIamRole.arn
export const pipelineNodegroupIamRoleArn = pipelineNodegroupIamRole.arn

// Attach policies to a role.
function attachPoliciesToRole(name: string, role: aws.iam.Role, policyArns: string[]) {
    for (const policyArn of policyArns) {
        new aws.iam.RolePolicyAttachment(`${name}-${policyArn.split('/')[1]}`,
            { policyArn: policyArn, role: role },
        )
    }
}