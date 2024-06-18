import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "./config"

export function createPhpmyadminProduction(provider: Provider): void {
    new k8s.helm.v3.Chart("phpmyadmin-production", {
        chart: "phpmyadmin",
        fetchOpts: {
            repo: "https://charts.bitnami.com/bitnami",
        },
        namespace: config.appSvcsNamespaceName,
        values: {
            nodeSelector: {
                "worker": "operationsNodeGroup"
            },
            db: {
                host: "domain"
            },
        }
    },  { providers: { "kubernetes": provider } })
}