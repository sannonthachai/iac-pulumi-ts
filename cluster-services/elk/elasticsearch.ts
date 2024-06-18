import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "../config"

export function createElasticsearch(provider: Provider, dependsOn: any): k8s.helm.v3.Chart {
    return new k8s.helm.v3.Chart("elasticsearch", {
        chart: "elasticsearch",
        fetchOpts: {
            repo: "https://helm.elastic.co",
            version: "7.17.3"
        },
        namespace: config.clusterSvcsNamespaceName,
        values: {
            nodeSelector: {
                "worker": "operationsNodeGroup"
            },
            persistence: {
                enabled: true
            },
            volumeClaimTemplate: {
                accessModes: [ "ReadWriteOnce" ],
                storageClassName: "gp2",
                resources: {
                    requests: {
                        storage: "300Gi"
                    }
                }
            },
            resources: {
                requests: {
                    cpu: "100m",
                    memory: "512Mi"
                },
            },
            replicas: 2,
            antiAffinity: "soft",
            esJavaOpts: "-Xmx512m -Xms512m",
            lifecycle: {
                postStart: {
                    exec: {
                        command: [
                            "bash",
                            "-c",
                            "#!/bin/bash\n",
                            "# Add a template to adjust number of shards/replicas\n",
                            "TEMPLATE_NAME=my_template\n",
                            'INDEX_PATTERN="logstash-*"\n' +
                            "SHARD_COUNT=8\n" +
                            "REPLICA_COUNT=1\n" +
                            "ES_URL=http://localhost:9200\n" +
                            `while [[ "$(curl -s -o /dev/null -w '%{http_code}\n' $ES_URL)" != "200" ]]; do sleep 1; done\n` +
                            `curl -XPUT "$ES_URL/_template/$TEMPLATE_NAME" -H 'Content-Type: application/json' -d'{"index_patterns":['\""$INDEX_PATTERN"\"'],"settings":{"number_of_shards":'$SHARD_COUNT',"number_of_replicas":'$REPLICA_COUNT'}}'\n`
                        ]
                    }
                }
            }
        }
    },  { 
        providers: { "kubernetes": provider },
        dependsOn
    })
}