import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "./config"

export function createSealedSecretsWeb(provider: Provider): void {
    new k8s.helm.v3.Chart("sealed-secrets-web", {
        chart: "sealed-secrets-web",
        fetchOpts: {
            repo: "https://charts.bakito.net",
        },
        namespace: config.appSvcsNamespaceName,
        values: {
            nodeSelector: {
                "worker": "operationsNodeGroup"
            },
            sealedSecrets: {
                namespace: "kube-system",
                serviceName: "sealed-secrets-controller"
            }
        }
    },  { providers: { "kubernetes": provider } })
}