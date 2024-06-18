import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "./config"

export function createDroneRunner(provider: Provider): void {
    new k8s.helm.v3.Chart("drone-runner-kube", {
        chart: "drone-runner-kube",
        fetchOpts: {
            repo: "https://charts.drone.io",
        },
        namespace: config.appSvcsNamespaceName,
        values: {
            nodeSelector: {
                "worker": "operationsNodeGroup"
            },
            env: {
                "DRONE_RPC_SECRET": "${secret}",
            }
        }
    },  { providers: { "kubernetes": provider } })
}