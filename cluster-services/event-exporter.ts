import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "./config"

export function createKubernetesEventExporter(provider: Provider, dependsOn: any): void {
    new k8s.helm.v3.Chart("kubernetes-event-exporter", {
        chart: "kubernetes-event-exporter",
        fetchOpts: {
            repo: "https://charts.bitnami.com/bitnami",
        },
        namespace: config.clusterSvcsNamespaceName,
        values: {
            nodeSelector: {
                "worker": "operationsNodeGroup" 
            },
            config: {
                receivers: [
                    {
                        name: "dump",
                        elasticsearch: {
                            hosts: ["http://localhost:9200"],
                            index: "kube-events"
                        }
                    }
                ]
            }
        }
    },  { 
        providers: { "kubernetes": provider },
        dependsOn
    })
}
// http://elasticsearch-master.cluster-svcs:9200/