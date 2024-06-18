import * as pulumi from "@pulumi/pulumi"

let pulumiConfig = new pulumi.Config()

export const config = {
    adminsIamRoleName: pulumiConfig.require("adminsIamRoleName"),
    adminsIamRolePolicyName: pulumiConfig.require("adminsIamRolePolicyName"),
    devsIamRoleName: pulumiConfig.require("devsIamRoleName"),
    developAppsNodeGroupName: pulumiConfig.require("developAppsNodeGroupName"),
    developAppsNodeGroupIamRoleName: pulumiConfig.require("developAppsNodeGroupIamRoleName"),
    stagingAppsNodeGroupName: pulumiConfig.require("stagingAppsNodeGroupName"),
    stagingAppsNodeGroupIamRoleName: pulumiConfig.require("stagingAppsNodeGroupIamRoleName"),
    productionAppsNodeGroupName: pulumiConfig.require("productionAppsNodeGroupName"),
    productionAppsNodeGroupIamRoleName: pulumiConfig.require("productionAppsNodeGroupIamRoleName"),
    operationsNodeGroupName: pulumiConfig.require("operationsNodeGroupName"),
    operationsNodeGroupIamRoleName: pulumiConfig.require("operationsNodeGroupIamRoleName"),
    pipelineNodeGroupName: pulumiConfig.require("pipelineNodeGroupName"),
    pipelineNodeGroupIamRoleName: pulumiConfig.require("pipelineNodeGroupIamRoleName"),
    cloudwatchAdminPolicy: pulumiConfig.require("cloudwatchAdminPolicy"),
    cloudwatchPolicy: pulumiConfig.require("cloudwatchPolicy"),
}