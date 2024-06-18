import * as certmanager from "@pulumi/kubernetes-cert-manager"
import { CustomResource } from '@pulumi/kubernetes/apiextensions'
import { Provider } from "@pulumi/kubernetes"
import { config } from "./config"

const acme = {
    email: "",
    privateKeySecret: "issuer-account-key"
}

export function createCertManger(provider: Provider): void {
    const certManager = new certmanager.CertManager("cert-manager", {
        installCRDs: true,
        helmOptions: {
            namespace: config.certManagerNamespace,
        },
        cainjector: {
            nodeSelector: {
                "worker": "operationsNodeGroup"
            }
        },
        webhook: {
            nodeSelector: {
                "worker": "operationsNodeGroup"
            }
        }
    })
    
    new CustomResource('cert-manager-cluster-issuer', {
        apiVersion: 'cert-manager.io/v1',
        kind: 'ClusterIssuer',
        metadata: {
          name: 'letsencrypt',
        },
        spec: {
            acme: {
                server: 'https://acme-v02.api.letsencrypt.org/directory',
                email: acme.email,
                privateKeySecretRef: {
                    name: acme.privateKeySecret,
                },
                solvers: [
                    {
                        http01: {
                            ingress: {
                                class: 'nginx',
                            },
                        },
                    },
                ],
            },
        },
    }, { 
        provider,
        dependsOn: certManager
    })
}