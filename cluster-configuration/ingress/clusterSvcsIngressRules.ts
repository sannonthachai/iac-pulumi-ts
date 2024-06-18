import * as k8s from "@pulumi/kubernetes"
import { config } from "../config"

const clusterSvcsIngressName = "cluster-svcs-ingress"
const rules = {
    kibana: {
        name: "kibana",
        service: "kibana-kibana",
        port: 5601,
        host: "",
        path: "/",
        secretName: "kibana-tls"
    },
    grafana: {
        name: "prometheus-grafana",
        service: "prometheus-grafana",
        port: 3000,
        host: "",
        path: "/",
        secretName: "prometheus-grafana-tls"
    }
}

const url = ''

export function createClusterSvcsIngressRules(): void {
    new k8s.networking.v1.Ingress(clusterSvcsIngressName, {
        metadata: {
            name: clusterSvcsIngressName,
            namespace: config.clusterSvcsNamespace,
            annotations: {
                "kubernetes.io/ingress.class": "nginx",
                "cert-manager.io/cluster-issuer": "letsencrypt",
                "nginx.ingress.kubernetes.io/auth-url": `${url}/oauth2/auth`,
                "nginx.ingress.kubernetes.io/auth-signin": `${url}/oauth2/start?rd=${url}/oauth2/callback`
            },
        },
        spec: {
            rules: [
                {
                    host: rules.kibana.host,
                    http: {
                        paths: [{
                            pathType: "Prefix",
                            path: rules.kibana.path,
                            backend: {
                                service: {
                                    name: rules.kibana.service,
                                    port: { number: rules.kibana.port },
                                },
                            },
                        }],
                    },
                },
            ],
            tls: [
                {
                    hosts: [
                        rules.kibana.host
                    ],
                    secretName: rules.kibana.secretName
                }
            ]
        },
    })

    new k8s.networking.v1.Ingress(rules.grafana.name, {
        metadata: {
            name: rules.grafana.name,
            namespace: config.clusterSvcsNamespace,
            annotations: {
                "kubernetes.io/ingress.class": "nginx",
                "cert-manager.io/cluster-issuer": "letsencrypt",
            },
        },
        spec: {
            rules: [
                {
                    host: rules.grafana.host,
                    http: {
                        paths: [{
                            pathType: "Prefix",
                            path: rules.grafana.path,
                            backend: {
                                service: {
                                    name: rules.grafana.service,
                                    port: { number: rules.grafana.port },
                                },
                            },
                        }],
                    },
                },
            ],
            tls: [
                {
                    hosts: [
                        rules.grafana.host
                    ],
                    secretName: rules.grafana.secretName
                }
            ]
        },
    })
}