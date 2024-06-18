import * as pulumi from "@pulumi/pulumi"
import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "./config"

interface NameSpace {
    clusterSvcsNamespaceName: pulumi.Output<string>
    appSvcsNamespaceName: pulumi.Output<string>
    appsNamespaceName: pulumi.Output<string>
    appsStagingNamespaceName: pulumi.Output<string>
    appsProductionNamespaceName: pulumi.Output<string>
    certManagerNamespaceName: pulumi.Output<string>
    nginxNamespaceName: pulumi.Output<string>
    // droneNamespaceName: pulumi.Output<string>
}

export function createNamespace(provider: Provider): NameSpace {
    const clusterSvcsNamespace = new k8s.core.v1.Namespace(config.clusterSvcsNamespace, { metadata: { name: config.clusterSvcsNamespace } }, { provider })
    const appSvcsNamespace = new k8s.core.v1.Namespace(config.appSvcsNamespace, { metadata: { name: config.appSvcsNamespace } }, { provider })
    const appsNamespace = new k8s.core.v1.Namespace(config.appsNamespace, { metadata: { name: config.appsNamespace } }, { provider })
    const appsStagingNamespace = new k8s.core.v1.Namespace(config.appsStagingNamespace, { metadata: { name: config.appsStagingNamespace } }, { provider })
    const appsProductionNamespace = new k8s.core.v1.Namespace(config.appsProductionNamespace, { metadata: { name: config.appsProductionNamespace } }, { provider })
    const certManagerNamespace = new k8s.core.v1.Namespace(config.certManagerNamespace, { metadata: { name: config.certManagerNamespace } }, { provider })
    const nginxNamespace = new k8s.core.v1.Namespace(config.nginxNamespace, { metadata: { name: config.nginxNamespace } }, { provider })
    // const droneNamespace = new k8s.core.v1.Namespace(config.droneNamespace, { metadata: { name: config.droneNamespace } }, { provider })

    return {
        clusterSvcsNamespaceName: clusterSvcsNamespace.metadata.name,
        appSvcsNamespaceName: appSvcsNamespace.metadata.name,
        appsNamespaceName: appsNamespace.metadata.name,
        appsStagingNamespaceName: appsStagingNamespace.metadata.name,
        appsProductionNamespaceName: appsProductionNamespace.metadata.name,
        certManagerNamespaceName: certManagerNamespace.metadata.name,
        nginxNamespaceName: nginxNamespace.metadata.name,
        // droneNamespaceName: droneNamespace.metadata.name,
    }
}