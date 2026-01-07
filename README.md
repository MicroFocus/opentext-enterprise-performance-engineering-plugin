# enterprise-performance-engineering-harness-plugin

## Requirements

- Docker runner (local, Kubernetes, or Harness delegate)
- Network access to the OpenText Enterprise Performance Engineering server
- Valid OpenText Enterprise Performance Engineering credentials (user/password or token)
- Writable workspace and output directories


## Action Inputs

| Environment Variable              | Description                                                                                                                                                                                                                      | Required | Default                                |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|----------------------------------------|
| **PLUGIN_LRE_ACTION** | action to be triggered. Current supported action: ExecuteLreTest | false | ExecuteLreTest |
| **PLUGIN_LRE_DESCRIPTION** | Description of the action (will be displayed in console logs) | false | |
| **PLUGIN_LRE_SERVER** | Server, port (when not mentionned, default is 80 or 433 for secured) and tenant (when not mentionned, default is ?tenant=fa128c06-5436-413d-9cfa-9f04bb738df3). e.g.: mylreserver.mydomain.com:81/?tenant=fa128c06-5436-413d-9cfa-9f04bb738df3' | true |                                        |
| **PLUGIN_LRE_HTTPS_PROTOCOL** | Use secured protocol for connecting to the server. Possible values: true or false | false | false |
| **PLUGIN_LRE_AUTHENTICATE_WITH_TOKEN** | Authenticate with token (access key). Required when SSO is configured in the server. Possible values: true or false | false | false |
| **PLUGIN_LRE_USERNAME** | Username | true | |
| **PLUGIN_LRE_PASSWORD** | Password | true | |
| **PLUGIN_LRE_DOMAIN** | domain (case sensitive) | true | |
| **PLUGIN_LRE_PROJECT** |  project (case sensitive) | true | |
| **PLUGIN_LRE_TEST** |valid test ID# or relative path to yaml file in git repo defining new test design creation | true | |
| **PLUGIN_LRE_TEST_INSTANCE** | either specify AUTO to use any instance or a specific instance ID | false | AUTO |
| **PLUGIN_LRE_TIMESLOT_DURATION_HOURS** | timeslot duration in hours | false | 0 |
| **PLUGIN_LRE_TIMESLOT_DURATION_MINUTES** | timeslot duration in minutes | false | 30 |
| **PLUGIN_LRE_POST_RUN_ACTION** | Possible values for post run action: 'Collate Results', 'Collate and Analyze' or 'Do Not Collate' | false | Do Not Collate |
| **PLUGIN_LRE_VUDS_MODE** | Use VUDS licenses. Possible values: true or false | false | false |
| **PLUGIN_LRE_TREND_REPORT** | The possible values (no value or not defined means no trend monitoring in build but will not cancel trend report defined in LRE): ASSOCIATED (the trend report defined in the test design will be used') or specify valid report ID# | false | |
| **PLUGIN_LRE_PROXY_OUT_URL** | proxy URL | false | |
| **PLUGIN_LRE_USERNAME_PROXY** | proxy username | false | |
| **PLUGIN_LRE_PASSWORD_PROXY** | proxy password | false | |
| **PLUGIN_LRE_SEARCH_TIMESLOT** | Experimental: Search for matching timeslot instead of creating a new timeslot. Possible values: true or false | false | false |
| **PLUGIN_LRE_STATUS_BY_SLA** | Report success status according to SLA. Possible values: true or false | false | false |
| **PLUGIN_LRE_OUTPUT_DIR** | The directory to save a simple result file (workspace will be used if not provided) | false | $HARNESS_STEP_OUTPUTS_PATH or $HARNESS_WORKSPACE |
| **PLUGIN_LRE_WORKSPACE_DIR** | Access to the workspace to save reports and logs (The directory to read the checkout) | true | $HARNESS_WORKSPACE |
| **PLUGIN_LRE_ENABLE_STACKTRACE** | if set to true, stacktrace of exception will be displayed with error occur reported in console logs  | false | false |

\* Either username/password or token authentication must be used.


## Basic usage

Example of running the plugin locally using Docker:

```powershell
$imageBase = "my-node-java-app"
$imageVersion = "1.0"
$imageName = "${imageBase}:${imageVersion}"

docker run -it --rm `
  -v C:/temp/harness/output:/harness/output `
  -v C:/temp/harness/workspace:/harness/workspace `
  -e PLUGIN_LRE_ACTION="ExecuteLreTest" `
  -e PLUGIN_LRE_DESCRIPTION="running new test" `
  -e PLUGIN_LRE_SERVER="http://<Server>/?tenant=<tenant-id>" `
  -e PLUGIN_LRE_HTTPS_PROTOCOL=false `
  -e PLUGIN_LRE_AUTHENTICATE_WITH_TOKEN=false `
  -e PLUGIN_LRE_USERNAME="<lreusername>" `
  -e PLUGIN_LRE_PASSWORD="<lrepassword>" `
  -e PLUGIN_LRE_DOMAIN="<domain>" `
  -e PLUGIN_LRE_PROJECT="<project>" `
  -e PLUGIN_LRE_TEST=<testid> `
  -e PLUGIN_LRE_TIMESLOT_DURATION_HOURS=0 `
  -e PLUGIN_LRE_TIMESLOT_DURATION_MINUTES=30 `
  -e PLUGIN_LRE_POST_RUN_ACTION="Collate and Analyze" `
  -e PLUGIN_LRE_OUTPUT_DIR="/harness/output" `
  -e PLUGIN_LRE_WORKSPACE_DIR="/harness/workspace" `
  $imageName

```

### Harness pipeline example (this is where many READMEs fail)

Harness users **expect YAML**.

## Harness pipeline example

```yaml
steps:
  - step:
      name: Run LRE Test
      type: Container
      spec:
        image: my-node-java-app:1.0
        shell: Sh
        envVariables:
          PLUGIN_LRE_ACTION: ExecuteLreTest
          PLUGIN_LRE_DESCRIPTION: running new test
          PLUGIN_LRE_SERVER: http://<Server>/?tenant=<tenant-id>
          PLUGIN_LRE_HTTPS_PROTOCOL: "false"
          PLUGIN_LRE_AUTHENTICATE_WITH_TOKEN: "false"
          PLUGIN_LRE_USERNAME: <+secrets.getValue("lre_username")>
          PLUGIN_LRE_PASSWORD: <+secrets.getValue("lre_password")>
          PLUGIN_LRE_DOMAIN: <domain>
          PLUGIN_LRE_PROJECT: <project>
          PLUGIN_LRE_TEST: "<testid>"
          PLUGIN_LRE_TIMESLOT_DURATION_MINUTES: "30"
          PLUGIN_LRE_POST_RUN_ACTION: Collate and Analyze
          PLUGIN_LRE_OUTPUT_DIR: /harness/output
          PLUGIN_LRE_WORKSPACE_DIR: /harness/workspace
        resources:
          limits:
            memory: 2Gi
            cpu: 1
```

## Configuration parameters

All configuration is provided using environment variables.

## Output

The plugin writes execution logs and result files to:

- Output directory: `$PLUGIN_LRE_OUTPUT_DIR`
- Workspace directory: `$PLUGIN_LRE_WORKSPACE_DIR`

These directories should be mapped to Harness workspace paths
to allow artifact collection and post-processing.

## Authentication

The plugin supports:
- Username / password authentication
- Token-based authentication

Set `PLUGIN_LRE_AUTHENTICATE_WITH_TOKEN=true` to enable token authentication.

## Troubleshooting

- Ensure the container has network access to the LRE server
- Verify credentials and tenant ID
- Enable stack traces by setting:
  `PLUGIN_LRE_ENABLE_STACKTRACE=true`

## Related plugins

- GitHub Action: https://github.com/MicroFocus/lre-gh-action
- GitLab CI Plugin: https://gitlab.com/loadrunner-enterprise/lre-gitlab-action

This Harness plugin uses the same core logic and configuration model.

## Authors and acknowledgment

Developed and maintained by the OpenText Enterprise Performance Engineering team.

Contributors:
- Daniel Danan

Thanks to all contributors, reviewers, and users who provided feedback and helped
improve the stability and usability of this plugin.

## License

This project is licensed under the MIT License.
See the [LICENSE](LICENSE) file for details.

