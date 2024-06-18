import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "./config"

export function createArgoCD(provider: Provider): void {
    new k8s.helm.v3.Chart("argo-cd", {
        chart: "argo-cd",
        fetchOpts: {
            repo: "https://argoproj.github.io/argo-helm",
        },
        namespace: config.appSvcsNamespaceName,
        values: {
            controller: {
                nodeSelector: {
                    "worker": "operationsNodeGroup"
                }
            },
            dex: {
                nodeSelector: {
                    "worker": "operationsNodeGroup"
                }
            },
            redis: {
                nodeSelector: {
                    "worker": "operationsNodeGroup"
                }
            },
            server: {
                nodeSelector: {
                    "worker": "operationsNodeGroup"
                }
            },
            repoServer: {
                nodeSelector: {
                    "worker": "operationsNodeGroup"
                }
            },
            applicationSet: {
                nodeSelector: {
                    "worker": "operationsNodeGroup"
                }
            },
            notifications: {
                nodeSelector: {
                    "worker": "operationsNodeGroup"
                }
            },
            configs: {
                cm: {
                    "admin.enabled": false,
                    url: "https://argo-cd.domain",
                    "dex.config":
                        "connectors:\n" +
                        "- type: bitbucket-cloud\n" +
                        "  id: bitbucket-cloud\n" +
                        "  name: Bitbucket Cloud\n" +
                        "  config:\n" +
                        "    clientID: ${secret}\n" +
                        "    clientSecret: ${secret}\n" +
                        "    redirectURI: https://argo-cd.domain/api/dex/callback\n" +
                        "    scopes:\n" +
                        "    - email\n" +
                        "    teams:\n" +
                        "    - engineer\n"
                },
                rbac: {
                    "policy.default": "role:readonly",
                    "policy.csv":
                        "p, role:org-admin, applications, *, */*, allow\n" +
                        "p, role:org-admin, applicationsets, *, */*, allow\n" +
                        "p, role:org-admin, logs, *, */*, allow\n" +
                        "p, role:org-admin, exec, *, */*, allow\n" +
                        "p, role:org-admin, clusters, *, *, allow\n" +
                        "p, role:org-admin, projects, *, *, allow\n" +
                        "p, role:org-admin, repositories, *, *, allow\n" +
                        "p, role:org-admin, certificates, *, *, allow\n" +
                        "p, role:org-admin, accounts, *, *, allow\n" +
                        "p, role:org-admin, gpgkeys, *, *, allow\n" +
                        "p, role:org-admin, extensions, *, *, allow\n" +
                        "g, engineer, role:org-admin\n"
                }
            }
        },
    },  { providers: { "kubernetes": provider } })
}