import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "./config"

export function createRedis(provider: Provider): void {
    new k8s.helm.v3.Chart("redis", {
        chart: "redis",
        fetchOpts: {
            repo: "https://charts.bitnami.com/bitnami",
        },
        namespace: config.appSvcsNamespaceName,
        values: {
            master: {
                nodeSelector: {
                    "worker": "operationsNodeGroup",
                },
                persistence: {
                    size: "20Gi"
                },
                service: {
                    clusterIP: "10.100.159.155"
                },
            },
            replica: {
                nodeSelector: {
                    "worker": "operationsNodeGroup",
                },
                replicaCount: 1,
                persistence: {
                    size: "20Gi"
                }
            }
        }
    },  { providers: { "kubernetes": provider }, ignoreChanges: ["root"] })
}