import * as pulumi from "@pulumi/pulumi"

let pulumiConfig = new pulumi.Config()

// Existing Pulumi stack reference in the format:
// <organization>/<project>/<stack> e.g. "myUser/myProject/dev"
const identityStackRef = new pulumi.StackReference(pulumiConfig.require("identityStackRef"))
const infraStackRef = new pulumi.StackReference(pulumiConfig.require("infraStackRef"))

export const config = {
    // Identity
    adminsIamRoleArn: identityStackRef.getOutput("adminsIamRoleArn"),
    devsIamRoleArn         : identityStackRef.getOutput("devsIamRoleArn"),
    developAppsNodegroupIamRoleArn : identityStackRef.getOutput("developAppsNodegroupIamRoleArn"),
    stagingAppsNodegroupIamRoleArn : identityStackRef.getOutput("stagingAppsNodegroupIamRoleArn"),
    productionAppsNodegroupIamRoleArn : identityStackRef.getOutput("productionAppsNodegroupIamRoleArn"),
    operationsNodegroupIamRoleArn: identityStackRef.getOutput("operationsNodegroupIamRoleArn"),
    pipelineNodegroupIamRoleArn: identityStackRef.getOutput("pipelineNodegroupIamRoleArn"),

    // Infrastructure / Networking
    vpcId: infraStackRef.getOutput("vpcId"),
    publicSubnetIds: infraStackRef.getOutput("publicSubnetIds"),
    privateSubnetIds: infraStackRef.getOutput("privateSubnetIds"),

    // Cluster
    clusterName: pulumiConfig.require("clusterName"),
    k8sVersion: pulumiConfig.require("k8sVersion"),
    project: pulumiConfig.require("project"),
    org: pulumiConfig.require("org"),
    developAppsNodeGroupIamRoleName: pulumiConfig.require("developAppsNodeGroupIamRoleName"),
    stagingAppsNodeGroupIamRoleName: pulumiConfig.require("stagingAppsNodeGroupIamRoleName"),
    productionAppsNodeGroupIamRoleName: pulumiConfig.require("productionAppsNodeGroupIamRoleName"),
    operationsNodeGroupIamRoleName: pulumiConfig.require("operationsNodeGroupIamRoleName"),
    pipelineNodeGroupIamRoleName: pulumiConfig.require("pipelineNodeGroupIamRoleName"),
    developAppsNodeGroupType: pulumiConfig.require("developAppsNodeGroupType"),
    developAppsNodeGroupInstanceType: pulumiConfig.require("developAppsNodeGroupInstanceType"),
    developAppsNodeGroupDesiredCapacity: pulumiConfig.require("developAppsNodeGroupDesiredCapacity"),
    developAppsNodeGroupMinSize: pulumiConfig.require("developAppsNodeGroupMinSize"),
    developAppsNodeGroupMaxSize: pulumiConfig.require("developAppsNodeGroupMaxSize"),
    developAppsNodeGroupLabelWoker: pulumiConfig.require("developAppsNodeGroupLabelWoker"),
    stagingAppsNodeGroupType: pulumiConfig.require("stagingAppsNodeGroupType"),
    stagingAppsNodeGroupInstanceType: pulumiConfig.require("stagingAppsNodeGroupInstanceType"),
    stagingAppsNodeGroupDesiredCapacity: pulumiConfig.require("stagingAppsNodeGroupDesiredCapacity"),
    stagingAppsNodeGroupMinSize: pulumiConfig.require("stagingAppsNodeGroupMinSize"),
    stagingAppsNodeGroupMaxSize: pulumiConfig.require("stagingAppsNodeGroupMaxSize"),
    stagingAppsNodeGroupLabelWoker: pulumiConfig.require("stagingAppsNodeGroupLabelWoker"),
    productionAppsNodeGroupType: pulumiConfig.require("productionAppsNodeGroupType"),
    productionAppsNodeGroupInstanceType: pulumiConfig.require("productionAppsNodeGroupInstanceType"),
    productionAppsNodeGroupDesiredCapacity: pulumiConfig.require("productionAppsNodeGroupDesiredCapacity"),
    productionAppsNodeGroupMinSize: pulumiConfig.require("productionAppsNodeGroupMinSize"),
    productionAppsNodeGroupMaxSize: pulumiConfig.require("productionAppsNodeGroupMaxSize"),
    productionAppsNodeGroupLabelWoker: pulumiConfig.require("productionAppsNodeGroupLabelWoker"),
    operationsNodeGroupType: pulumiConfig.require("operationsNodeGroupType"),
    operationsNodeGroupInstanceType: pulumiConfig.require("operationsNodeGroupInstanceType"),
    operationsNodeGroupDesiredCapacity: pulumiConfig.require("operationsNodeGroupDesiredCapacity"),
    operationsNodeGroupMinSize: pulumiConfig.require("operationsNodeGroupMinSize"),
    operationsNodeGroupMaxSize: pulumiConfig.require("operationsNodeGroupMaxSize"),
    operationsNodeGroupLabelWoker: pulumiConfig.require("operationsNodeGroupLabelWoker"),
    pipelineNodeGroupType: pulumiConfig.require("pipelineNodeGroupType"),
    pipelineNodeGroupInstanceType: pulumiConfig.require("pipelineNodeGroupInstanceType"),
    pipelineNodeGroupDesiredCapacity: pulumiConfig.require("pipelineNodeGroupDesiredCapacity"),
    pipelineNodeGroupMinSize: pulumiConfig.require("pipelineNodeGroupMinSize"),
    pipelineNodeGroupMaxSize: pulumiConfig.require("pipelineNodeGroupMaxSize"),
    pipelineNodeGroupLabelWoker: pulumiConfig.require("pipelineNodeGroupLabelWoker"),
    clusterSvcsNamespace: pulumiConfig.require("clusterSvcsNamespace"),
    appSvcsNamespace: pulumiConfig.require("appSvcsNamespace"),
    appsNamespace: pulumiConfig.require("appsNamespace"),
    appsStagingNamespace: pulumiConfig.require("appsStagingNamespace"),
    appsProductionNamespace: pulumiConfig.require("appsProductionNamespace"),
    certManagerNamespace: pulumiConfig.require("certManagerNamespace"),
    nginxNamespace: pulumiConfig.require("nginxNamespace"),
    droneNamespace: pulumiConfig.require("droneNamespace"),
    roleBindingDev: pulumiConfig.require("roleBindingDev"),
    podSecurityPolicy: pulumiConfig.require("podSecurityPolicy"),
    KubeSystemCRB: pulumiConfig.require("KubeSystemCRB"),
    AppsCRB: pulumiConfig.require("AppsCRB"),
    privilegedCRB: pulumiConfig.require("privilegedCRB"),
    privilegedCRBMetaData: pulumiConfig.require("privilegedCRBMetaData"),
    jenkinsWorkerCR: pulumiConfig.require("jenkinsWorkerCR"),
    jenkinsWorkerCRB: pulumiConfig.require("jenkinsWorkerCRB"),
    productionAppsNodeGroupTypeNew: pulumiConfig.require("productionAppsNodeGroupTypeNew"),
    productionAppsNodeGroupDesiredCapacityNew: pulumiConfig.require("productionAppsNodeGroupDesiredCapacityNew"),
    productionAppsNodeGroupMinSizeNew: pulumiConfig.require("productionAppsNodeGroupMinSizeNew"),
    productionAppsNodeGroupMaxSizeNew: pulumiConfig.require("productionAppsNodeGroupMaxSizeNew"),
    operationsNodeGroupTypeNew: pulumiConfig.require("operationsNodeGroupTypeNew"),
    operationsNodeGroupDesiredCapacityNew: pulumiConfig.require("operationsNodeGroupDesiredCapacityNew"),
    operationsNodeGroupMinSizeNew: pulumiConfig.require("operationsNodeGroupMinSizeNew"),
    operationsNodeGroupMaxSizeNew: pulumiConfig.require("operationsNodeGroupMaxSizeNew"),

    /*
    defaultVpcId: infraStackRef.getOutput("defaultVpcId"),
    defaultPublicSubnetIds: infraStackRef.getOutput("defaultPublicSubnetIds"),
    defaultPrivateSubnetIds: infraStackRef.getOutput("defaultPrivateSubnetIds"),
    */

    /*
    existingVpcId: infraStackRef.getOutput("existingVpcId"),
    existingPublicSubnetIds: infraStackRef.getOutput("existingPublicSubnetIds"),
    existingPrivateSubnetIds: infraStackRef.getOutput("existingPrivateSubnetIds"),
    */
}