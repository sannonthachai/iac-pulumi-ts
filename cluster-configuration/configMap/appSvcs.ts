import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "../config"

const dockerConfigName = "docker-config"

export function createAppSvcsConfigMap(provider: Provider): void {
    new k8s.core.v1.ConfigMap(dockerConfigName, {
        data: {
            "config.json": 
                "{\n" +
                '  "credHelpers": {\n' +
                '    "248783859424.dkr.ecr.ap-southeast-1.amazonaws.com": "ecr-login"\n' +
                "  }\n" +
                "}\n"
        },
        metadata: {
            name: dockerConfigName,
            namespace: config.appSvcsNamespace,
        }
    }, { 
        provider, 
        deleteBeforeReplace: true,
        dependsOn: provider
    })
}