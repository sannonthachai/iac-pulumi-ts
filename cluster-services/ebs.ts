import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "./config"

export function createEbsCsiDriver(provider: Provider): k8s.helm.v3.Chart {
    return new k8s.helm.v3.Chart("aws-ebs-csi-driver", {
        chart: "aws-ebs-csi-driver",
        fetchOpts: {
            repo: "https://kubernetes-sigs.github.io/aws-ebs-csi-driver",
        },
        namespace: config.clusterSvcsNamespaceName,
        values: {
            controller: {
                nodeSelector: {
                    "worker": "operationsNodeGroup"
                }
            }
        }
    },  { providers: { "kubernetes": provider } })
}