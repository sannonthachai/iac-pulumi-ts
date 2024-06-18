import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "./config"

export function createRedisInsightOAuth2Proxy(provider: Provider): void {
    new k8s.helm.v3.Chart("redis-insight-oauth2-proxy", {
        chart: "oauth2-proxy",
        fetchOpts: {
            repo: "https://charts.bitnami.com/bitnami",
        },
        namespace: config.appSvcsNamespaceName,
        values: {
            nodeSelector: {
                "worker": "operationsNodeGroup"
            },
            configuration: {
                clientID: "${secret}",
                clientSecret: "${secret}",
                cookieSecret: "",
            },
            extraArgs: [
                "--provider=bitbucket",
                "--scope=email"
            ],
            redis: {
                enabled: false
            }
        }
    },  { providers: { "kubernetes": provider } })
}