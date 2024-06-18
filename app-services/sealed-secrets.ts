import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"

export function createSealedSecrets(provider: Provider): void {
    new k8s.helm.v3.Chart("sealed-secrets", {
        chart: "sealed-secrets",
        fetchOpts: {
            repo: "https://bitnami-labs.github.io/sealed-secrets",
        },
        namespace: "kube-system",
        values: {
            fullnameOverride: 'sealed-secrets-controller',
            nodeSelector: {
                "worker": "operationsNodeGroup"
            }
        }
    },  { providers: { "kubernetes": provider } })
}