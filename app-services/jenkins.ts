import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "./config"

/**
 * Plugins
 * blueocean
 * nodejs
 */

export function createJenkins(provider: Provider): void {
    new k8s.helm.v3.Chart("jenkins", {
        chart: "jenkins",
        fetchOpts: {
            repo: "https://charts.jenkins.io",
        },
        namespace: config.appSvcsNamespaceName,
        values: {
            controller: {
                nodeSelector: {
                    "worker": "operationsNodeGroup"
                },
                resources: {
                    requests: {
                        cpu: "100m",
                        memory: "512Mi"
                    },
                    limits: {
                        cpu: "500m",
                        memory: "2G"
                    }
                },
                javaOpts: "-Xmx512m"
            },
            persistence: {
                size: "20Gi",
            }
        }
    },  { providers: { "kubernetes": provider } })
}