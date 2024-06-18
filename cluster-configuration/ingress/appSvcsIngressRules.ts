import * as k8s from "@pulumi/kubernetes"
import { config } from "../config"

const rules = {
    // jenkins: {
    //     name: "jenkins-ingress",
    //     service: "jenkins",
    //     port: 8080,
    //     host: "",
    //     path: "/",
    //     secretName: "jenkins-tls"
    // },
    argoCD: {
        name: "argo-cd-ingress",
        service: "argo-cd-argocd-server",
        portName: "https",
        host: "",
        path: "/",
        secretName: "argocd-secret"
    },
    sealedSecretsWeb: {
        name: "sealed-secrets-web-ingress",
        service: "sealed-secrets-web",
        port: 80,
        host: "",
        path: "/",
        secretName: "sealed-secrets-web-tls"
    },
    kibana: {
        name: "kibana",
        service: "kibana-kibana",
        port: 5601,
        host: "",
        path: "/",
        secretName: "kibana-tls"
    },
    redisInsight: {
        name: "redis-insight",
        service: "redisinsight-service",
        port: 8001,
        host: "",
        path: "/",
        secretName: "redis-insight-tls"
    },
    drone: {
        name: "drone",
        service: "drone",
        port: 8080,
        host: "",
        path: "/",
        secretName: "drone-tls"
    },
    pdfServer: {
        name: "pdfd-server",
        service: "pdfd-server",
        port: 8090,
        host: "",
        path: "/",
        secretName: "wildcard-2024"
    },
    metabase: {
        name: "metabase",
        service: "metabase",
        port: 3000,
        host: "",
        path: "/",
        secretName: "metabase-tls"
    }
}

const sealedSecretsWebUrl = ''
const redisInsightUrl = ''

export function createAppSvcsIngressRules(): void {
    // new k8s.networking.v1.Ingress(rules.jenkins.name, {
    //     metadata: {
    //         name: rules.jenkins.name,
    //         namespace: config.appSvcsNamespace,
    //         annotations: {
    //             "kubernetes.io/ingress.class": "nginx",
    //             "cert-manager.io/cluster-issuer": "letsencrypt",
    //         },
    //     },
    //     spec: {
    //         rules: [
    //             {
    //                 // Replace this with your own domain!
    //                 host: rules.jenkins.host,
    //                 http: {
    //                     paths: [{
    //                         pathType: "Prefix",
    //                         path: rules.jenkins.path,
    //                         backend: {
    //                             service: {
    //                                 name: rules.jenkins.service,
    //                                 port: { number: rules.jenkins.port },
    //                             },
    //                         },
    //                     }],
    //                 },
    //             },
    //         ],
    //         tls: [
    //             {
    //                 hosts: [
    //                     rules.jenkins.host
    //                 ],
    //                 secretName: rules.jenkins.secretName
    //             }
    //         ]
    //     },
    // })

    new k8s.networking.v1.Ingress(rules.argoCD.name, {
        metadata: {
            name: rules.argoCD.name,
            namespace: config.appSvcsNamespace,
            annotations: {
                "kubernetes.io/ingress.class": "nginx",
                "cert-manager.io/cluster-issuer": "letsencrypt",
                "kubernetes.io/tls-acme": "true",
                "nginx.ingress.kubernetes.io/ssl-passthrough": "true",
                "nginx.ingress.kubernetes.io/backend-protocol": "HTTPS"
            },
        },
        spec: {
            rules: [
                {
                    // Replace this with your own domain!
                    host: rules.argoCD.host,
                    http: {
                        paths: [{
                            pathType: "Prefix",
                            path: rules.argoCD.path,
                            backend: {
                                service: {
                                    name: rules.argoCD.service,
                                    port: { name: rules.argoCD.portName },
                                },
                            },
                        }],
                    },
                },
            ],
            tls: [
                {
                    hosts: [
                        rules.argoCD.host
                    ],
                    secretName: rules.argoCD.secretName
                }
            ]
        },
    })

    new k8s.networking.v1.Ingress(rules.sealedSecretsWeb.name, {
        metadata: {
            name: rules.sealedSecretsWeb.name,
            namespace: config.appSvcsNamespace,
            annotations: {
                "kubernetes.io/ingress.class": "nginx",
                "cert-manager.io/cluster-issuer": "letsencrypt",
                "nginx.ingress.kubernetes.io/auth-url": `${sealedSecretsWebUrl}/oauth2/auth`,
                "nginx.ingress.kubernetes.io/auth-signin": `${sealedSecretsWebUrl}/oauth2/start?rd=${sealedSecretsWebUrl}/oauth2/callback`
            },
        },
        spec: {
            rules: [
                {
                    // Replace this with your own domain!
                    host: rules.sealedSecretsWeb.host,
                    http: {
                        paths: [{
                            pathType: "Prefix",
                            path: rules.sealedSecretsWeb.path,
                            backend: {
                                service: {
                                    name: rules.sealedSecretsWeb.service,
                                    port: { number: rules.sealedSecretsWeb.port },
                                },
                            },
                        }],
                    },
                },
            ],
            tls: [
                {
                    hosts: [
                        rules.sealedSecretsWeb.host
                    ],
                    secretName: rules.sealedSecretsWeb.secretName
                }
            ]
        },
    })

    new k8s.networking.v1.Ingress(rules.redisInsight.name, {
        metadata: {
            name: rules.redisInsight.name,
            namespace: config.appSvcsNamespace,
            annotations: {
                "kubernetes.io/ingress.class": "nginx",
                "cert-manager.io/cluster-issuer": "letsencrypt",
                "nginx.ingress.kubernetes.io/auth-url": `${redisInsightUrl}/oauth2/auth`,
                "nginx.ingress.kubernetes.io/auth-signin": `${redisInsightUrl}/oauth2/start?rd=${redisInsightUrl}/oauth2/callback`
            },
        },
        spec: {
            rules: [
                {
                    // Replace this with your own domain!
                    host: rules.redisInsight.host,
                    http: {
                        paths: [{
                            pathType: "Prefix",
                            path: rules.redisInsight.path,
                            backend: {
                                service: {
                                    name: rules.redisInsight.service,
                                    port: { number: rules.redisInsight.port },
                                },
                            },
                        }],
                    },
                },
            ],
            tls: [
                {
                    hosts: [
                        rules.redisInsight.host
                    ],
                    secretName: rules.redisInsight.secretName
                }
            ]
        },
    })

    new k8s.networking.v1.Ingress(rules.drone.name, {
        metadata: {
            name: rules.drone.name,
            namespace: config.appSvcsNamespace,
            annotations: {
                "kubernetes.io/ingress.class": "nginx",
                "cert-manager.io/cluster-issuer": "letsencrypt",
            },
        },
        spec: {
            rules: [
                {
                    // Replace this with your own domain!
                    host: rules.drone.host,
                    http: {
                        paths: [{
                            pathType: "Prefix",
                            path: rules.drone.path,
                            backend: {
                                service: {
                                    name: rules.drone.service,
                                    port: { number: rules.drone.port },
                                },
                            },
                        }],
                    },
                },
            ],
            tls: [
                {
                    hosts: [
                        rules.drone.host
                    ],
                    secretName: rules.drone.secretName
                }
            ]
        },
    })

    new k8s.networking.v1.Ingress(rules.pdfServer.name, {
        metadata: {
            name: rules.pdfServer.name,
            namespace: config.appSvcsNamespace,
            annotations: {
                "kubernetes.io/ingress.class": "nginx",
                "nginx.ingress.kubernetes.io/proxy-body-size": "10m",
                "nginx.ingress.kubernetes.io/proxy-read-timeout": "3600",
                "nginx.ingress.kubernetes.io/proxy-send-timeout": "3600",
            },
        },
        spec: {
            rules: [
                {
                    // Replace this with your own domain!
                    host: rules.pdfServer.host,
                    http: {
                        paths: [{
                            pathType: "Prefix",
                            path: rules.pdfServer.path,
                            backend: {
                                service: {
                                    name: rules.pdfServer.service,
                                    port: { number: rules.pdfServer.port },
                                },
                            },
                        }],
                    },
                },
            ],
            tls: [
                {
                    hosts: [
                        rules.pdfServer.host
                    ],
                    secretName: rules.pdfServer.secretName
                }
            ]
        },
    })

    new k8s.networking.v1.Ingress(rules.metabase.name, {
        metadata: {
            name: rules.metabase.name,
            namespace: config.appSvcsNamespace,
            annotations: {
                "kubernetes.io/ingress.class": "nginx",
                "cert-manager.io/cluster-issuer": "letsencrypt",
            },
        },
        spec: {
            rules: [
                {
                    // Replace this with your own domain!
                    host: rules.metabase.host,
                    http: {
                        paths: [{
                            pathType: "Prefix",
                            path: rules.metabase.path,
                            backend: {
                                service: {
                                    name: rules.metabase.service,
                                    port: { number: rules.metabase.port },
                                },
                            },
                        }],
                    },
                },
            ],
            tls: [
                {
                    hosts: [
                        rules.metabase.host
                    ],
                    secretName: rules.metabase.secretName
                }
            ]
        },
    })

    new k8s.networking.v1.Ingress("oauth2-proxy", {
        metadata: {
            name: "oauth2-proxy",
            namespace: config.appSvcsNamespace,
            annotations: {
                "kubernetes.io/ingress.class": "nginx",
                "cert-manager.io/cluster-issuer": "letsencrypt"
            },
        },
        spec: {
            rules: [
                {
                    // Replace this with your own domain!
                    host: rules.sealedSecretsWeb.host,
                    http: {
                        paths: [{
                            pathType: "Prefix",
                            path: "/oauth2",
                            backend: {
                                service: {
                                    name: "sealed-secrets-web-oauth2-proxy",
                                    port: { number: 80 },
                                },
                            },
                        }],
                    },
                },
                {
                    // Replace this with your own domain!
                    host: rules.kibana.host,
                    http: {
                        paths: [{
                            pathType: "Prefix",
                            path: "/oauth2",
                            backend: {
                                service: {
                                    name: "kibana-oauth2-proxy",
                                    port: { number: 80 },
                                },
                            },
                        }],
                    },
                },
                {
                    // Replace this with your own domain!
                    host: rules.redisInsight.host,
                    http: {
                        paths: [{
                            pathType: "Prefix",
                            path: "/oauth2",
                            backend: {
                                service: {
                                    name: "redis-insight-oauth2-proxy",
                                    port: { number: 80 },
                                },
                            },
                        }],
                    },
                },
            ],
            tls: [
                {
                    hosts: [
                        rules.sealedSecretsWeb.host
                    ],
                    secretName: "oauth2-proxy-sealed-secrets-web-tls"
                },
                {
                    hosts: [
                        rules.kibana.host
                    ],
                    secretName: "oauth2-proxy-kibana-tls"
                },
                {
                    hosts: [
                        rules.redisInsight.host
                    ],
                    secretName: "oauth2-proxy-redis-insight-tls"
                }
            ]
        },
    })
}