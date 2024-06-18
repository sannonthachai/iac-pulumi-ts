import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "./config"

export function createMetabase(provider: Provider): void {
    new k8s.helm.v3.Chart("metabase", {
        chart: "metabase",
        fetchOpts: {
            repo: "https://pmint93.github.io/helm-charts",
        },
        namespace: config.appSvcsNamespaceName,
        values: {
            image: {
                tag: "v0.47.0"
            },
            nodeSelector: {
                "worker": "operationsNodeGroup"
            },
            database: {
                type: "mysql",
                host: "",
                port: 3306,
                dbname: "",
                username: "${secret}",
                password: "${secret}"
            },
            extraEnv: [
                {
                    name: "MB_SESSION_COOKIE_SAMESITE",
                    value: "none"
                },
                {
                    name: "MB_EMBEDDING_APP_ORIGIN",
                    value: "domain"
                }
            ]
        }
    },  { providers: { "kubernetes": provider } })
}