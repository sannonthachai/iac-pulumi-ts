import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "../config"

export function createLogstash(provider: Provider, dependsOn: any): void {
    new k8s.helm.v3.Chart("logstash", {
        chart: "logstash",
        fetchOpts: {
            repo: "https://helm.elastic.co",
            version: "7.17.3"
        },
        namespace: config.clusterSvcsNamespaceName,
        values: {
            nodeSelector: {
                "worker": "operationsNodeGroup"
            },
            logstashJavaOpts: "-Xmx512m -Xms512m",
            resources: {
                requests: {
                    cpu: "100m",
                    memory: "512Mi"
                },
            },
            logstashConfig: {
                "logstash.yml": 
                    "http.host: 0.0.0.0\n" +
                    "pipeline.ecs_compatibility: disabled\n"
            },
            logstashPipeline: {
                "logstash.conf":
                    "input {\n" +
                    "  beats {\n" +
                    "    port => 5044\n" +
                    "  }\n" +
                    "}\n" + 
                    "filter {\n" +
                    "  mutate {\n" +
                    '    gsub => ["message", "\e\[[0-9;]*m", ""]\n' +
                    "  }\n" +
                    "  grok {\n" +
                    '    match => { "message" => "- %{DATA:date}, %{DATA:time}   %{GREEDYDATA:json_data} " }\n' +
                    "  }\n" +
                    "  json {\n" +
                    '    source => "json_data"\n' +
                    '    target => "parsed_json"\n' +
                    "  }\n" +
                    "}\n" +
                    "output {\n" +
                    "  elasticsearch {\n" +
                    '    index => "logstash-%{[@metadata][beat]}"\n' +
                    '    hosts => [ "elasticsearch-master.cluster-svcs.svc.cluster.local:9200" ]\n' +
                    "  }\n" +
                    "}\n" 
            }
        }
    },  { 
        providers: { "kubernetes": provider },
        dependsOn
    })
}

// input {
//   beats {
//     port => 5044
//   }
// }
// filter {
//   if [kubernetes][namespace] in ["apps", "apps-staging", "apps-production"] {
//     mutate {
//       gsub => ["message", "\e\[[0-9;]*m", ""]
//     }
//     if [kubernetes][container][name] == "" {
//       grok {
//         match => { "message" => "- %{DATA:date}, %{DATA:time}  %{SPACE}%{NOTSPACE:log_level} %{GREEDYDATA:json_data}" }
//       }
//     } else {
//       grok {
//         match => { "message" => "- %{DATA:date}, %{DATA:time}   %{GREEDYDATA:json_data} " }
//       }
//     }
//     json {
//       source => "json_data"
//       target => "parsed_json"
//     }
//   }
// }
// output {
//   if [kubernetes][namespace] in ["apps", "apps-staging", "apps-production"] {
//     elasticsearch {
//       index => "logstash-%{[@metadata][beat]}"
//       hosts => [ "elasticsearch-master.cluster-svcs.svc.cluster.local:9200" ]
//     }
//   }
// }