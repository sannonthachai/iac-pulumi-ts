import * as k8s from "@pulumi/kubernetes"
import { Provider } from "@pulumi/kubernetes"
import { config } from "./config"

export function createGrafana(provider: Provider, dependsOn: any): void {
    new k8s.helm.v3.Chart("grafana", {
        chart: "grafana",
        fetchOpts: {
            repo: "https://grafana.github.io/helm-charts",
        },
        namespace: config.clusterSvcsNamespaceName,
        values: {
            nodeSelector: {
                "worker": "operationsNodeGroup" 
            },
            datasources: {
                "datasources.yaml": 
                    "apiVersion: 1\n" +
                    "datasources:\n" +
                    "- name: Prometheus\n" +
                    "  type: prometheus\n" +
                    "  url: http://prometheus-server.cluster-svcs.svc.cluster.local\n" +
                    "  access: proxy\n" +
                    "  isDefault: true\n"
            }
        }
    },  { 
        providers: { "kubernetes": provider },
        dependsOn
    })
}

// apiVersion: 1
// datasources:
// - name: Prometheus
//   type: prometheus
//   url: http://prometheus-server.cluster-svcs.svc.cluster.local
//   access: proxy
//   isDefault: true

// [analytics]
// check_for_updates = true
// [grafana_net]
// url = https://grafana.net
// [log]
// mode = console
// [paths]
// data = /var/lib/grafana/
// logs = /var/log/grafana
// plugins = /var/lib/grafana/plugins
// provisioning = /etc/grafana/provisioning
// [server]
// domain = ''
// root_url = https://grafana.domain
// [auth]
// disable_login_form = true
// oauth_allow_insecure_email_lookup = true
// [users]
// auto_assign_org_role = Admin
// [auth.generic_oauth]
// name = BitBucket
// enabled = true
// allow_sign_up = true
// auto_login = false
// client_id =
// client_secret =
// scopes = account email
// auth_url = https://bitbucket.org/site/oauth2/authorize
// token_url = https://bitbucket.org/site/oauth2/access_token
// api_url = https://api.bitbucket.org/2.0/user
// teams_url = https://api.bitbucket.org/2.0/user/permissions/workspaces
// team_ids_attribute_path = values[*].workspace.slug
// team_ids = engineer
// allow_assign_grafana_admin = true
// role_attribute_path = contains(info.roles[*], 'admin') && 'GrafanaAdmin' || contains(info.roles[*], 'editor') && 'Editor' || 'Viewer'
// skip_org_role_sync = true