import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "../config"

export function createFilebeat(provider: Provider, dependsOn: any): void {
    new k8s.helm.v3.Chart("filebeat", {
        chart: "filebeat",
        fetchOpts: {
            repo: "https://helm.elastic.co",
            version: "7.17.3"
        },
        namespace: config.clusterSvcsNamespaceName,
        values: {
            daemonset: {
                filebeatConfig: {
                    "filebeat.yml": 
                        "filebeat.inputs:\n" +
                        "  - type: container\n" +
                        "    paths:\n" +
                        "      - /var/log/containers/*.log\n" +
                        "    exclude_files  :\n" +
                        "      - /var/log/containers/java.*\n" +
                        "    processors:\n" +
                        "      - add_kubernetes_metadata:\n" +
                        "          host: ${NODE_NAME}\n" +
                        "          matchers:\n" +
                        "          - logs_path:\n" +
                        '              logs_path: "/var/log/containers/"\n' +
                        "output.logstash:\n" +
                        '  hosts: ["logstash-logstash-headless.cluster-svcs.svc.cluster.local:5044"]\n'
                }
            }
        }
    },  { 
        providers: { "kubernetes": provider },
        dependsOn
    })
}