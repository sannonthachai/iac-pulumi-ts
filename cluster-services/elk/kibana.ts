import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "../config"

export function createKibana(provider: Provider, dependsOn: any): void {
    new k8s.helm.v3.Chart("kibana", {
        chart: "kibana",
        fetchOpts: {
            repo: "https://helm.elastic.co",
            version: "7.17.3"
        },
        namespace: config.clusterSvcsNamespaceName,
        values: {
            nodeSelector: {
                "worker": "operationsNodeGroup"
            },
            resources: {
                requests: {
                    cpu: "100m",
                    memory: "512Mi"
                },
            },
        }
    },  { 
        providers: { "kubernetes": provider },
        dependsOn
    })
}