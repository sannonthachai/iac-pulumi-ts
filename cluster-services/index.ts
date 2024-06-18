import * as k8s from "@pulumi/kubernetes"
import { config } from "./config"
import { createEbsCsiDriver } from "./ebs"
import { createElasticsearch } from "./elk/elasticsearch"
import { createKibana } from "./elk/kibana"
import { createLogstash } from "./elk/logstash"
import { createFilebeat } from "./elk/filebeat"
import { createPrometheus } from "./prometheus"
import { createGrafana } from "./grafana"
import { createKubernetesEventExporter } from "./event-exporter"

const provider = new k8s.Provider("provider", {kubeconfig: config.kubeconfig})

const ebs = createEbsCsiDriver(provider)
const elastic = createElasticsearch(provider, ebs)
createKibana(provider, elastic)
createLogstash(provider, elastic)
createFilebeat(provider, elastic)
createPrometheus(provider, ebs)
createKubernetesEventExporter(provider, ebs)
// createGrafana(provider, ebs)