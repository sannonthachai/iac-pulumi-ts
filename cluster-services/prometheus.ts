import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "./config"

export function createPrometheus(provider: Provider, dependsOn: any): void {
    new k8s.helm.v3.Chart("prometheus", {
        chart: "kube-prometheus-stack",
        fetchOpts: {
            repo: "https://prometheus-community.github.io/helm-charts",
        },
        namespace: config.clusterSvcsNamespaceName,
        values: {
            alertmanager: {
                alertmanagerSpec: {
                    nodeSelector: {
                        "worker": "operationsNodeGroup" 
                    },
                }
            },
            grafana: {
                nodeSelector: {
                    "worker": "operationsNodeGroup" 
                },
            },
            prometheusOperator: {
                admissionWebhooks: {
                    patch: {
                        podAnnotations: {
                            "sidecar.istio.io/inject": "false"
                        },
                        nodeSelector: {
                            "worker": "operationsNodeGroup" 
                        }
                    }
                },
                nodeSelector: {
                    "worker": "operationsNodeGroup" 
                }
            },
            prometheus: {
                prometheusSpec: {
                    nodeSelector: {
                        "worker": "operationsNodeGroup" 
                    }
                }
            }
        }
    },  { 
        providers: { "kubernetes": provider },
        dependsOn
    })
}