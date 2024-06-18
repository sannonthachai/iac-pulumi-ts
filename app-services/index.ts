import * as k8s from "@pulumi/kubernetes"
import { config } from "./config"
import { createJenkins } from "./jenkins"
import { createArgoCD } from './argocd'
import { createSealedSecrets } from './sealed-secrets'
import { createSealedSecretsWeb } from './sealed-secrets-web'
import { createRedis } from './redis'
import { createRedisProduction } from './redis-production'
import { createSealedSecretsWebOAuth2Proxy } from './sealed-secrets-web-oauth2-proxy'
import { createKibanaOAuth2Proxy } from './kibana-oauth2-proxy'
import { createRedisInsightOAuth2Proxy } from './redis-insight-oauth2-proxy'
import { createDrone } from './drone'
import { createDroneRunner } from './drone-runner'
import { createPhpmyadmin } from './phpmyadmin'
import { createMetabase } from './metabase'
import { createPhpmyadminProduction } from './phpmyadmin-production'

const provider = new k8s.Provider("provider", {kubeconfig: config.kubeconfig})

// createJenkins(provider)
createArgoCD(provider)
createSealedSecrets(provider)
createSealedSecretsWeb(provider)
createRedis(provider)
createRedisProduction(provider)
createSealedSecretsWebOAuth2Proxy(provider)
createKibanaOAuth2Proxy(provider)
createRedisInsightOAuth2Proxy(provider)
createDrone(provider)
createDroneRunner(provider)
// createPhpmyadmin(provider)
// createPhpmyadminProduction(provider)
createMetabase(provider)