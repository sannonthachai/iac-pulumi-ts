import * as aws from "@pulumi/aws"
import * as eks from "@pulumi/eks"
import * as k8s from "@pulumi/kubernetes"
import * as pulumi from "@pulumi/pulumi"
import { config } from "./config"
import { createAppSvcsConfigMap } from "./configMap/appSvcs"
import { createCertManger } from "./cert-manager"
import { createNamespace } from "./namespace"
import { createIngress } from "./ingress/ingress"
import { createClusterSvcsIngressRules } from "./ingress/clusterSvcsIngressRules"
import { createAppSvcsIngressRules } from "./ingress/appSvcsIngressRules"

const projectName = pulumi.getProject()

export const adminsIamRoleArn = config.adminsIamRoleArn
export const devsIamRoleArn = config.devsIamRoleArn
export const developAppsNodegroupIamRoleArn = config.developAppsNodegroupIamRoleArn
export const stagingAppsNodegroupIamRoleArn = config.stagingAppsNodegroupIamRoleArn
export const productionAppsNodegroupIamRoleArn = config.productionAppsNodegroupIamRoleArn
export const operationsNodegroupIamRoleArn = config.operationsNodegroupIamRoleArn
export const pipelineNodegroupIamRoleArn = config.pipelineNodegroupIamRoleArn
const adminsIamRoleName = adminsIamRoleArn.apply(s => s.split("/")).apply(s => s[1])
const devsIamRoleName = devsIamRoleArn.apply(s => s.split("/")).apply(s => s[1])
const developAppsNodegroupIamRoleName = developAppsNodegroupIamRoleArn.apply(s => s.split("/")).apply(s => s[1])
const stagingAppsNodegroupIamRoleName = stagingAppsNodegroupIamRoleArn.apply(s => s.split("/")).apply(s => s[1])
const productionAppsNodegroupIamRoleName = productionAppsNodegroupIamRoleArn.apply(s => s.split("/")).apply(s => s[1])
const operationsNodegroupIamRoleName = operationsNodegroupIamRoleArn.apply(s => s.split("/")).apply(s => s[1])
const pipelineNodegroupIamRoleName = pipelineNodegroupIamRoleArn.apply(s => s.split("/")).apply(s => s[1])
const rulesFullAccess = [
    {
        apiGroups: [""],
        resources: ["configmap", "pods", "secrets", "services", "persistentvolumeclaims"],
        verbs: ["get", "list", "watch", "create", "update", "delete", "patch"],
    },
    {
        apiGroups: ["rbac.authorization.k8s.io"],
        resources: ["clusterrole", "clusterrolebinding", "role", "rolebinding"],
        verbs: ["get", "list", "watch", "create", "update", "delete", "patch"],
    },
    {
        apiGroups: ["extensions", "apps"],
        resources: ["replicasets", "deployments"],
        verbs: ["get", "list", "watch", "create", "update", "delete", "patch"],
    },
]

// Create an EKS cluster.
const cluster = new eks.Cluster(`${projectName}`, {
    name: config.clusterName,
    instanceRoles: [
        aws.iam.Role.get(config.developAppsNodeGroupIamRoleName, developAppsNodegroupIamRoleName),
        aws.iam.Role.get(config.stagingAppsNodeGroupIamRoleName, stagingAppsNodegroupIamRoleName),
        aws.iam.Role.get(config.productionAppsNodeGroupIamRoleName, productionAppsNodegroupIamRoleName),
        aws.iam.Role.get(config.operationsNodeGroupIamRoleName, operationsNodegroupIamRoleName),
        aws.iam.Role.get(config.pipelineNodeGroupIamRoleName, pipelineNodegroupIamRoleName),
    ],
    roleMappings: [
        {
            roleArn: config.adminsIamRoleArn,
            groups: ["system:masters"],
            username: "pulumi:admins",
        },
        {
            roleArn: config.devsIamRoleArn,
            groups: ["pulumi:devs"],
            username: "pulumi:alice",
        }
    ],
    vpcId: config.vpcId,
    publicSubnetIds: config.publicSubnetIds,
    privateSubnetIds: config.privateSubnetIds,
    // storageClasses: {
    //     "gp2-encrypted": { type: "gp2", encrypted: true, volumeBindingMode: "WaitForFirstConsumer" },
    //     "sc1": { type: "sc1"},
    // },
    nodeAssociatePublicIpAddress: false,
    skipDefaultNodeGroup: true,
    deployDashboard: false,
    version: config.k8sVersion,
    tags: {
        "Project": config.project,
        "Org": config.org,
    },
    clusterSecurityGroupTags: { "ClusterSecurityGroupTag": "true" },
    nodeSecurityGroupTags: { "NodeSecurityGroupTag": "true" },
    enabledClusterLogTypes: ["api", "audit", "authenticator", "controllerManager", "scheduler"],
    // kubernetesServiceIpAddressRange: "10.110.0.0/16",
    // endpointPublicAccess: false,     // Requires bastion to access cluster API endpoint
    // endpointPrivateAccess: true,     // Requires bastion to access cluster API endpoint
})

// Export the cluster details.
export const kubeconfig = cluster.kubeconfig.apply(JSON.stringify)
export const clusterName = cluster.core.cluster.name
export const region = aws.config.region
export const securityGroupIds = [cluster.nodeSecurityGroup.id]

new eks.NodeGroup(`${projectName}-${config.developAppsNodeGroupType}`, {
    cluster: cluster,
    instanceProfile: new aws.iam.InstanceProfile(
        config.developAppsNodeGroupType, 
        {
            role: developAppsNodegroupIamRoleName,
            name: config.developAppsNodeGroupType,
        }
    ),
    nodeAssociatePublicIpAddress: false,
    nodeSecurityGroup: cluster.nodeSecurityGroup,
    clusterIngressRule: cluster.eksClusterIngressRule,
    instanceType: config.developAppsNodeGroupInstanceType,
    desiredCapacity: +config.developAppsNodeGroupDesiredCapacity,
    minSize: +config.developAppsNodeGroupMinSize,
    maxSize: +config.developAppsNodeGroupMaxSize,
    labels: {
        "worker": config.developAppsNodeGroupLabelWoker
    },
    cloudFormationTags: clusterName.apply(clusterName => ({
        "CloudFormationGroupTag": "true",
        "k8s.io/cluster-autoscaler/enabled": "true",
        [`k8s.io/cluster-autoscaler/${clusterName}`]: "true",
    })),
}, {
    providers: { kubernetes: cluster.provider},
})

new eks.NodeGroup(`${projectName}-${config.stagingAppsNodeGroupType}`, {
    cluster: cluster,
    instanceProfile: new aws.iam.InstanceProfile(
        config.stagingAppsNodeGroupType, 
        {
            role: stagingAppsNodegroupIamRoleName,
            name: config.stagingAppsNodeGroupType,
        }
    ),
    nodeAssociatePublicIpAddress: false,
    nodeSecurityGroup: cluster.nodeSecurityGroup,
    clusterIngressRule: cluster.eksClusterIngressRule,
    instanceType: config.stagingAppsNodeGroupInstanceType,
    desiredCapacity: +config.stagingAppsNodeGroupDesiredCapacity,
    minSize: +config.stagingAppsNodeGroupMinSize,
    maxSize: +config.stagingAppsNodeGroupMaxSize,
    labels: {
        "worker": config.stagingAppsNodeGroupLabelWoker
    },
    // nodeRootVolumeSize: 40,
    // nodeSubnetIds: []
    // cloudFormationTags: clusterName.apply(clusterName => ({
    //     "CloudFormationGroupTag": "true",
    //     "k8s.io/cluster-autoscaler/enabled": "true",
    //     [`k8s.io/cluster-autoscaler/${clusterName}`]: "true",
    // })),
}, {
    providers: { kubernetes: cluster.provider},
})

new eks.NodeGroup(`${projectName}-${config.productionAppsNodeGroupType}`, {
    cluster: cluster,
    instanceProfile: new aws.iam.InstanceProfile(
        config.productionAppsNodeGroupType, 
        {
            role: productionAppsNodegroupIamRoleName,
            name: config.productionAppsNodeGroupType,
        }
    ),
    nodeAssociatePublicIpAddress: false,
    nodeSecurityGroup: cluster.nodeSecurityGroup,
    clusterIngressRule: cluster.eksClusterIngressRule,
    instanceType: config.productionAppsNodeGroupInstanceType,
    desiredCapacity: +config.productionAppsNodeGroupDesiredCapacity,
    minSize: +config.productionAppsNodeGroupMinSize,
    maxSize: +config.productionAppsNodeGroupMaxSize,
    labels: {
        "worker": config.productionAppsNodeGroupLabelWoker
    },
    cloudFormationTags: clusterName.apply(clusterName => ({
        "CloudFormationGroupTag": "true",
        "k8s.io/cluster-autoscaler/enabled": "true",
        [`k8s.io/cluster-autoscaler/${clusterName}`]: "true",
    })),
    nodeRootVolumeSize: 100,
}, {
    providers: { kubernetes: cluster.provider},
})

new eks.NodeGroup(`${projectName}-${config.productionAppsNodeGroupTypeNew}`, {
    cluster: cluster,
    instanceProfile: new aws.iam.InstanceProfile(
        config.productionAppsNodeGroupTypeNew, 
        {
            role: productionAppsNodegroupIamRoleName,
            name: config.productionAppsNodeGroupTypeNew,
        }
    ),
    nodeAssociatePublicIpAddress: false,
    nodeSecurityGroup: cluster.nodeSecurityGroup,
    clusterIngressRule: cluster.eksClusterIngressRule,
    instanceType: config.productionAppsNodeGroupInstanceType,
    desiredCapacity: +config.productionAppsNodeGroupDesiredCapacityNew,
    minSize: +config.productionAppsNodeGroupMinSizeNew,
    maxSize: +config.productionAppsNodeGroupMaxSizeNew,
    labels: {
        "worker": config.productionAppsNodeGroupLabelWoker
    },
    cloudFormationTags: clusterName.apply(clusterName => ({
        "CloudFormationGroupTag": "true",
        "k8s.io/cluster-autoscaler/enabled": "true",
        [`k8s.io/cluster-autoscaler/${clusterName}`]: "true",
    })),
    nodeRootVolumeSize: 100,
}, {
    providers: { kubernetes: cluster.provider},
})

new eks.NodeGroup(`${projectName}-${config.operationsNodeGroupType}`, {
    cluster: cluster,
    instanceProfile: new aws.iam.InstanceProfile(
        config.operationsNodeGroupType, 
        {
            role: operationsNodegroupIamRoleName, 
            name: config.operationsNodeGroupType,
        }
    ),
    nodeAssociatePublicIpAddress: false,
    nodeSecurityGroup: cluster.nodeSecurityGroup,
    clusterIngressRule: cluster.eksClusterIngressRule,
    instanceType: config.operationsNodeGroupInstanceType,
    desiredCapacity: +config.operationsNodeGroupDesiredCapacity,
    minSize: +config.operationsNodeGroupMinSize,
    maxSize: +config.operationsNodeGroupMaxSize,
    labels: {
        "worker": config.operationsNodeGroupLabelWoker
    },
    cloudFormationTags: clusterName.apply(clusterName => ({
        "CloudFormationGroupTag": "true",
        "k8s.io/cluster-autoscaler/enabled": "true",
        [`k8s.io/cluster-autoscaler/${clusterName}`]: "true",
    })),
}, {
    providers: { kubernetes: cluster.provider},
})

new eks.NodeGroup(`${projectName}-${config.operationsNodeGroupTypeNew}`, {
    cluster: cluster,
    instanceProfile: new aws.iam.InstanceProfile(
        config.operationsNodeGroupTypeNew, 
        {
            role: operationsNodegroupIamRoleName, 
            name: config.operationsNodeGroupTypeNew,
        }
    ),
    nodeAssociatePublicIpAddress: false,
    nodeSecurityGroup: cluster.nodeSecurityGroup,
    clusterIngressRule: cluster.eksClusterIngressRule,
    instanceType: config.operationsNodeGroupInstanceType,
    desiredCapacity: +config.operationsNodeGroupDesiredCapacityNew,
    minSize: +config.operationsNodeGroupMinSizeNew,
    maxSize: +config.operationsNodeGroupMaxSizeNew,
    labels: {
        "worker": config.operationsNodeGroupLabelWoker
    },
    cloudFormationTags: clusterName.apply(clusterName => ({
        "CloudFormationGroupTag": "true",
        "k8s.io/cluster-autoscaler/enabled": "true",
        [`k8s.io/cluster-autoscaler/${clusterName}`]: "true",
    })),
}, {
    providers: { kubernetes: cluster.provider},
})

new eks.NodeGroup(`${projectName}-${config.pipelineNodeGroupType}`, {
    cluster: cluster,
    instanceProfile: new aws.iam.InstanceProfile(
        config.pipelineNodeGroupType, 
        {
            role: pipelineNodegroupIamRoleName, 
            name: config.pipelineNodeGroupType,
        }
    ),
    nodeAssociatePublicIpAddress: false,
    nodeSecurityGroup: cluster.nodeSecurityGroup,
    clusterIngressRule: cluster.eksClusterIngressRule,
    instanceType: config.pipelineNodeGroupInstanceType,
    desiredCapacity: +config.pipelineNodeGroupDesiredCapacity,
    minSize: +config.pipelineNodeGroupMinSize,
    maxSize: +config.pipelineNodeGroupMaxSize,
    labels: {
        "worker": config.pipelineNodeGroupLabelWoker
    },
    cloudFormationTags: clusterName.apply(clusterName => ({
        "CloudFormationGroupTag": "true",
        "k8s.io/cluster-autoscaler/enabled": "true",
        [`k8s.io/cluster-autoscaler/${clusterName}`]: "true",
    })),
}, {
    providers: { kubernetes: cluster.provider},
})

// Create Configmap
createAppSvcsConfigMap(cluster.provider)

// Create Ingress ( wait cluster created )
createIngress(cluster.provider)
createClusterSvcsIngressRules()
createAppSvcsIngressRules()

// Create Cert Manager ( wait cluster created and createIngress )
createCertManger(cluster.provider)

// Create Kubernetes namespaces.
const namespace = createNamespace(cluster.provider)
export const clusterSvcsNamespaceName = namespace.clusterSvcsNamespaceName
export const appSvcsNamespaceName = namespace.appSvcsNamespaceName
export const appsNamespaceName = namespace.appsNamespaceName
export const certManagerNamespaceName = namespace.certManagerNamespaceName
export const nginxNamespaceName = namespace.nginxNamespaceName

// Create a limited role for the `pulumi:devs` to use in the apps namespace.
const roleNamespaces = [appsNamespaceName, nginxNamespaceName]
roleNamespaces.forEach((roleNs, index) => {
    const devsGroupRole = new k8s.rbac.v1.Role(`${config.roleBindingDev}-${index}`,
        {
            metadata: { namespace: roleNs },
            rules: rulesFullAccess,
        },
        { provider: cluster.provider },
    )

    // Bind the `pulumi:devs` RBAC group to the new, limited role.
    const devsGroupRoleBinding = new k8s.rbac.v1.RoleBinding(`${config.roleBindingDev}-${index}`,
        {
            metadata: { namespace: roleNs },
            subjects: [{
                kind: "Group",
                name: "pulumi:devs",
            }],
            roleRef: {
                apiGroup: "rbac.authorization.k8s.io",
                kind: "Role",
                name: devsGroupRole.metadata.name,
            },
        }, { provider: cluster.provider })
})

// Create a restrictive PodSecurityPolicy.
const restrictivePSP = new k8s.policy.v1beta1.PodSecurityPolicy(config.podSecurityPolicy, {
    metadata: { name: config.podSecurityPolicy },
    spec: {
        privileged: false,
        hostNetwork: false,
        allowPrivilegeEscalation: true,
        defaultAllowPrivilegeEscalation: true,
        hostPID: false,
        hostIPC: false,
        runAsUser: { rule: "RunAsAny" },
        fsGroup: { rule: "RunAsAny" },
        seLinux: { rule: "RunAsAny" },
        supplementalGroups: { rule: "RunAsAny" },
        volumes: [
            "configMap",
            "downwardAPI",
            "emptyDir",
            "persistentVolumeClaim",
            "secret",
            "projected"
        ],
        allowedCapabilities: [
            "*"
        ]
    }
}, { provider: cluster.provider })

// Create a ClusterRole to use the restrictive PodSecurityPolicy.
const restrictiveClusterRole = new k8s.rbac.v1.ClusterRole(config.podSecurityPolicy, {
    metadata: { name: config.podSecurityPolicy },
    rules: [
        {
            apiGroups: [
                "policy"
            ],
            resourceNames: [
                restrictivePSP.metadata.name,
            ],
            resources: [
                "podsecuritypolicies"
            ],
            verbs: [
                "use"
            ]
        }
    ]
}, { provider: cluster.provider })

// Create a ClusterRoleBinding for the ServiceAccounts of Namespace kube-system
// to the ClusterRole that uses the restrictive PodSecurityPolicy.
new k8s.rbac.v1.ClusterRoleBinding(config.KubeSystemCRB, {
    metadata: { name: config.KubeSystemCRB },
    roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: "ClusterRole",
        name: restrictiveClusterRole.metadata.name
    },
    subjects: [
        {
            kind: "Group",
            name: "system:serviceaccounts",
            namespace: "kube-system"
        }
    ]
}, { provider: cluster.provider })

// Create a ClusterRoleBinding for the RBAC group pulumi:devs
// to the ClusterRole that uses the restrictive PodSecurityPolicy.
new k8s.rbac.v1.ClusterRoleBinding(config.AppsCRB, {
    metadata: { name: config.AppsCRB },
    roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: "ClusterRole",
        name: restrictiveClusterRole.metadata.name
    },
    subjects: [
        {
            kind: "Group",
            name: "pulumi:devs",
            namespace: appsNamespaceName
        }
    ]
}, { provider: cluster.provider })

// Create a ClusterRoleBinding for the SeviceAccounts of Namespace ingress-nginx
// to the ClusterRole that uses the privileged PodSecurityPolicy.
new k8s.rbac.v1.ClusterRoleBinding(config.privilegedCRB, {
    metadata: { name: config.privilegedCRBMetaData },
    roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: "ClusterRole",
        name: "eks.privileged"
    },
    subjects: [
        {
            kind: "Group",
            name: "system:serviceaccounts:ingress-nginx",
            apiGroup: "rbac.authorization.k8s.io"
        }
    ]
}, { provider: cluster.provider })

new k8s.rbac.v1.ClusterRole(config.jenkinsWorkerCR, {
    metadata: { name: config.jenkinsWorkerCR },
    rules: rulesFullAccess,
}, { provider: cluster.provider })

new k8s.rbac.v1.ClusterRoleBinding(config.jenkinsWorkerCRB, {
    metadata: { name: config.jenkinsWorkerCRB },
    roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: "ClusterRole",
        name: config.jenkinsWorkerCR
    },
    subjects: [
        {
            kind: "ServiceAccount",
            name: "default",
            namespace: config.appSvcsNamespace,
        }
    ]
}, { provider: cluster.provider })