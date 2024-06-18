import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "./config"

export function createRedisProduction(provider: Provider): void {
    new k8s.helm.v3.Chart("redis-production", {
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
                    size: "60Gi"
                },
                service: {
                    clusterIP: "10.100.113.10"
                },
            },
            replica: {
                nodeSelector: {
                    "worker": "operationsNodeGroup",
                },
                replicaCount: 2,
                persistence: {
                    size: "60Gi"
                }
            }
        }
    },  { providers: { "kubernetes": provider } })
}