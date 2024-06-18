import * as pulumi from "@pulumi/pulumi"

let pulumiConfig = new pulumi.Config()

export const config = {
    vpcName: pulumiConfig.require("vpcName"),
    cidrBlock: pulumiConfig.require("cidrBlock"),
    dataBaseCidrBlock: pulumiConfig.require("dataBaseCidrBlock"),
    dataBaseVPC: pulumiConfig.require("dataBaseVPC"),
    eksVpcRouteTablePublic0: pulumiConfig.require("eksVpcRouteTablePublic0"),
    eksVpcRouteTablePublic1: pulumiConfig.require("eksVpcRouteTablePublic1"),
    eksVpcRouteTablePublic2: pulumiConfig.require("eksVpcRouteTablePublic2"),
    eksVpcRouteTablePrivate0: pulumiConfig.require("eksVpcRouteTablePrivate0"),
    eksVpcRouteTablePrivate1: pulumiConfig.require("eksVpcRouteTablePrivate1"),
    eksVpcRouteTablePrivate2: pulumiConfig.require("eksVpcRouteTablePrivate2"),
    dataBaseVPCRouteTable: pulumiConfig.require("dataBaseVPCRouteTable"),
    clusterConfigurationNodeSecurityGroup: pulumiConfig.require("clusterConfigurationNodeSecurityGroup"),
    dbDevSecurityGroup: pulumiConfig.require("dbDevSecurityGroup"),
    dbProductionSecurityGroup: pulumiConfig.require("dbProductionSecurityGroup"),
    clusterStackCidrBlock: pulumiConfig.require("clusterStackCidrBlock"),
    clusterStackVPC: pulumiConfig.require("clusterStackVPC"),
    clusterStackRouteTablePublicSubnets: pulumiConfig.require("clusterStackRouteTablePublicSubnets"),
    clusterStackRouteTableUnknown: pulumiConfig.require("clusterStackRouteTableUnknown"),
    clusterStackRouteTablePrivateAZ1: pulumiConfig.require("clusterStackRouteTablePrivateAZ1"),
    clusterStackRouteTablePrivateAZ2: pulumiConfig.require("clusterStackRouteTablePrivateAZ2"),
    clusterStackSecurityGroup: pulumiConfig.require("clusterStackSecurityGroup"),
}