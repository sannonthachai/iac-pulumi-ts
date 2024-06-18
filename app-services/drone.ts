import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "./config"

export function createDrone(provider: Provider): void {
    new k8s.helm.v3.Chart("drone", {
        chart: "drone",
        fetchOpts: {
            repo: "https://charts.drone.io",
        },
        namespace: config.appSvcsNamespaceName,
        values: {
            nodeSelector: {
                "worker": "operationsNodeGroup"
            },
            env: {
                "DRONE_BITBUCKET_CLIENT_ID": "${secret}",
                "DRONE_BITBUCKET_CLIENT_SECRET": "${secret}",
                "DRONE_RPC_SECRET": "${secret}",
                "DRONE_SERVER_HOST": "domain",
                "DRONE_SERVER_PROTO": "https"
            }
        }
    },  { providers: { "kubernetes": provider } })
}