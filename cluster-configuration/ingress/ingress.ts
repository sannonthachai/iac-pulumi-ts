import * as k8s from "@pulumi/kubernetes"
import * as pulumi from "@pulumi/pulumi"
import { Provider } from "@pulumi/kubernetes"
import { config } from "../config"

const removeHelmHooksTransformation = (
    o: pulumi.ResourceTransformationArgs
  ): pulumi.ResourceTransformationResult => {
    if (o.props?.metadata?.annotations?.["helm.sh/hook"]) {
      const {
        "helm.sh/hook": junk,
        "helm.sh/hook-delete-policy": junk2,
        ...validAnnotations
      } = o.props.metadata.annotations
      return {
        props: {
          ...o.props,
          metadata: {
            ...o.props.metadata,
            annotations: validAnnotations,
          },
        },
        opts: o.opts,
      }
    }
    return o
  }

export function createIngress(provider: Provider): void {
    new k8s.helm.v3.Chart("ingress-nginx", {
        chart: "ingress-nginx",
        fetchOpts: {
            repo: "https://kubernetes.github.io/ingress-nginx",
        },
        namespace: config.nginxNamespace,
        values: {
            controller: {
                nodeSelector: {
                    "worker": "operationsNodeGroup"
                },
                extraArgs: {
                    "enable-ssl-passthrough": "true"
                },
                admissionWebhooks: {
                    enabled: false
                }
            }
        },
    },  { 
        providers: { "kubernetes": provider },
        transformations: [removeHelmHooksTransformation],
    })}