import * as awsx from "@pulumi/awsx"
import * as aws from "@pulumi/aws"
import { config } from "./config"

// Create a new VPC with custom settings.
const vpc = new awsx.ec2.Vpc(config.vpcName, {
    cidrBlock: config.cidrBlock,
    numberOfAvailabilityZones: "all",
    tags: { "Name": config.vpcName },
})

export const vpcId = vpc.id
export const publicSubnetIds = vpc.publicSubnetIds
export const privateSubnetIds = vpc.privateSubnetIds

const listRouteTable = [
    {
        name: "eksVpcRouteTablePublic0",
        id: config.eksVpcRouteTablePublic0,
    },
    {
        name: "eksVpcRouteTablePublic1",
        id: config.eksVpcRouteTablePublic1
    },
    {
        name: "eksVpcRouteTablePublic2",
        id: config.eksVpcRouteTablePublic2
    },
    {
        name: "eksVpcRouteTablePrivate0",
        id: config.eksVpcRouteTablePrivate0,
    },
    {
        name: "eksVpcRouteTablePrivate1",
        id: config.eksVpcRouteTablePrivate1
    },
    {
        name: "eksVpcRouteTablePrivate2",
        id: config.eksVpcRouteTablePrivate2
    },
]

const peeringConnection = new aws.ec2.VpcPeeringConnection("peeringConnection", {
    vpcId,
    peerVpcId: config.dataBaseVPC,
    accepter: {
        allowRemoteVpcDnsResolution: true,
    },
    requester: {
        allowRemoteVpcDnsResolution: true,
    },
    tags: {
        vpcName: "",
        peerVpcName: "database-VPC",
    },
})

listRouteTable.forEach((rtb, i) => {
    new aws.ec2.Route(`${rtb.name}Peering`, {
        routeTableId: rtb.id,
        destinationCidrBlock: config.dataBaseCidrBlock,
        vpcPeeringConnectionId: peeringConnection.id,
    }, {
        dependsOn: peeringConnection,
    })
})

new aws.ec2.Route("dataBaseVPCRoutePeering", {
    routeTableId: config.dataBaseVPCRouteTable,
    destinationCidrBlock: config.cidrBlock,
    vpcPeeringConnectionId: peeringConnection.id,
}, {
    dependsOn: peeringConnection,
})

new aws.ec2.SecurityGroupRule("securityGroupForVPCPeering", {
    type: "ingress",
    fromPort: 0,
    toPort: 65535,
    protocol: "all",
    securityGroupId: config.dbDevSecurityGroup,
    sourceSecurityGroupId: config.clusterConfigurationNodeSecurityGroup,
    description: "eks-cluster-configuration-nodeSecurityGroup"
})

new aws.ec2.SecurityGroupRule("securityGroupForVPCPeeringProduction", {
    type: "ingress",
    fromPort: 0,
    toPort: 65535,
    protocol: "all",
    securityGroupId: config.dbProductionSecurityGroup,
    sourceSecurityGroupId: config.clusterConfigurationNodeSecurityGroup,
    description: "eks-cluster-configuration-nodeSecurityGroup"
})