import { exec } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { spawn } from 'child_process';

// Validate must environment variables only
const validateEnvVars = () => {
  const requiredEnvVars = [
    'PLUGIN_LRE_SERVER', 'PLUGIN_LRE_DOMAIN', 
    'PLUGIN_LRE_USERNAME', 'PLUGIN_LRE_PASSWORD',
    'PLUGIN_LRE_PROJECT', 'PLUGIN_LRE_TEST'
  ];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      throw new Error(`required ${envVar} environment variable is not set.`);
    }
  });
};

// Validate environment variables before proceeding
validateEnvVars();

// get all the enviroment variables into variables for further validation or replacement with default value
// Harness PLUGIN_* variables
let lreAction = process.env.PLUGIN_LRE_ACTION;
let lreDescription = process.env.PLUGIN_LRE_DESCRIPTION;
let lreServer = process.env.PLUGIN_LRE_SERVER;
let lreHttpsProtocol: boolean = process.env.PLUGIN_LRE_HTTPS_PROTOCOL === 'true';
let lreAuthenticateWithToken: boolean = process.env.PLUGIN_LRE_AUTHENTICATE_WITH_TOKEN === 'true';
let lreUsername = process.env.PLUGIN_LRE_USERNAME;
let lrePassword = process.env.PLUGIN_LRE_PASSWORD;
let lreDomain = process.env.PLUGIN_LRE_DOMAIN;
let lreProject = process.env.PLUGIN_LRE_PROJECT;
let lreTest = process.env.PLUGIN_LRE_TEST;
let lreTestInstance = process.env.PLUGIN_LRE_TEST_INSTANCE;
let lreTimeslotDurationHours: number = process.env.PLUGIN_LRE_TIMESLOT_DURATION_HOURS
    ? parseInt(process.env.PLUGIN_LRE_TIMESLOT_DURATION_HOURS)
    : 0;
let lreTimeslotDurationMinutes: number = process.env.PLUGIN_LRE_TIMESLOT_DURATION_MINUTES
    ? parseInt(process.env.PLUGIN_LRE_TIMESLOT_DURATION_MINUTES)
    : 0;
let lrePostRunAction = process.env.PLUGIN_LRE_POST_RUN_ACTION;
let lreVudsMode: boolean = process.env.PLUGIN_LRE_VUDS_MODE === 'true';
let lreTrendReport = process.env.PLUGIN_LRE_TREND_REPORT;
let lreProxyOutUrl = process.env.PLUGIN_LRE_PROXY_OUT_URL;
let lreUsernameProxy = process.env.PLUGIN_LRE_USERNAME_PROXY;
let lrePasswordProxy = process.env.PLUGIN_LRE_PASSWORD_PROXY;
let lreSearchTimeslot: boolean = process.env.PLUGIN_LRE_SEARCH_TIMESLOT === 'true';
let lreStatusBySla: boolean = process.env.PLUGIN_LRE_STATUS_BY_SLA === 'true';
let lreWorkspaceDir = process.env.PLUGIN_LRE_WORKSPACE_DIR ?? process.env.HARNESS_WORKSPACE;
let lreOutputDir = process.env.PLUGIN_LRE_OUTPUT_DIR ?? process.env.HARNESS_STEP_OUTPUTS_PATH ?? lreWorkspaceDir;
let lreEnableStacktrace: boolean = process.env.PLUGIN_LRE_ENABLE_STACKTRACE === 'true';

// Workspace directory in container


const validateInputVars = () => {
// Validate 'lre_action' parameter
	  if (!lreAction) {
		  lreAction = 'ExecuteLreTest';
	  }
	  
	  // Validate 'lre_description' parameter
	  if (!lreDescription) {
		  lreDescription = 'Executing LRE test';
	  }
	  
	  // Validate 'lre_server' parameter
	  if (!lreServer) {
		  throw new Error(`lre_server variable is not set.`);
	  }

	  // Validate 'lre_https_protocol' parameter
	  if (lreHttpsProtocol !== true && lreHttpsProtocol !== false) {
		  lreHttpsProtocol = false;
      }
	  
	  // Validate 'lre_authenticate_with_token' parameter
	  if (lreAuthenticateWithToken !== true && lreAuthenticateWithToken !== false) {
		  lreAuthenticateWithToken = false;
	  }

	  // Validate 'lre_username' parameter
	  if (!lreUsername) {
		  throw new Error(`lre_username variable is not set.`);
	  }
	  
	  // Validate 'lre_password' parameter
	  if (!lrePassword) {
		  throw new Error(`lre_password variable is not set.`);
	  }
	  
	  // Validate 'lre_domain' parameter
	  if (!lreDomain) {
		  throw new Error(`lre_domain variable is not set.`);
	  }
	  
	  // Validate 'lre_project' parameter
	  if (!lreProject) {
		  throw new Error(`lre_project variable is not set.`);
	  }
	  
	  // Validate 'lre_test' parameter
	  if (!lreTest) {
		  throw new Error(`lre_test variable is not set.`);
	  }
	  
	  // Validate 'lre_test_instance' parameter
	  if (!lreTestInstance || parseInt(lreTestInstance) <= 0) {
		  lreTestInstance = 'AUTO';
	  }
	  
	  // Validate 'lre_timeslot_duration_hours' parameter
	  if (!lreTimeslotDurationHours) {
		  lreTimeslotDurationHours = 0;
	  }
	  
	  // Validate 'lre_timeslot_duration_minutes' parameter
	  if (!lreTimeslotDurationMinutes || lreTimeslotDurationMinutes < 30) {
		  if(lreTimeslotDurationHours < 1) {
			  lreTimeslotDurationMinutes = 30;
		  }
	  }
	  
	  // Validate 'lre_post_run_action' parameter
	  if (!lrePostRunAction) {
		  lrePostRunAction = 'Do Not Collate';
	  }
	  
	  // Validate 'lre_vuds_mode' parameter
	  if (lreVudsMode !== true && lreVudsMode !== false) {
		  lreVudsMode = false;
	  }
	  
	  // Validate 'lre_trend_report' parameter
	  if (!lreTrendReport) {
		  lreTrendReport = '';
	  }
	  
	  // Validate 'lre_proxy_out_url' parameter
	  if (!lreProxyOutUrl) {
		  lreProxyOutUrl = '';
	  }
	  
	  // Validate 'lre_username_proxy' parameter
	  if (!lreUsernameProxy) {
		  lreUsernameProxy ='';
	  }
	  
	  // Validate 'lre_password_proxy' parameter
	  if (!lrePasswordProxy) {
		  lrePasswordProxy = '';
	  }
	  
	  // Validate 'lre_search_timeslot' parameter
	  if (lreSearchTimeslot !== true && lreSearchTimeslot !== false) {
		  lreSearchTimeslot = false;
	  }
	  
	  // Validate 'lre_status_by_sla' parameter
	  if (lreStatusBySla !== true && lreStatusBySla !== false) {
		  lreStatusBySla = false;
	  }
	  
	  // Validate 'lre_output_dir' parameter
	  if (!lreOutputDir) {
		  lreOutputDir = '';
	  }
	  
	  // Validate 'lre_workspace_dir' parameter
	  if (!lreWorkspaceDir) {
		  throw new Error(`lreWorkspaceDir variable is not set.`);
	  }
	  
	  // Validate 'lre_enable_stacktrace' parameter
	  if (lreEnableStacktrace !== true && lreEnableStacktrace !== false) {
		  lreEnableStacktrace = false;
	  }
};


// Define configuration object
const config = {
  lre_action: lreAction,
  lre_description: lreDescription,
  lre_server: lreServer,
  lre_https_protocol: lreHttpsProtocol,
  lre_authenticate_with_token: lreAuthenticateWithToken,
  lre_domain: lreDomain,
  lre_project: lreProject,
  lre_test: lreTest,
  lre_test_instance: lreTestInstance,
  lre_timeslot_duration_hours: lreTimeslotDurationHours,
  lre_timeslot_duration_minutes: lreTimeslotDurationMinutes,
  lre_post_run_action: lrePostRunAction,
  lre_vuds_mode: lreVudsMode,
  lre_trend_report: lreTrendReport,
  lre_proxy_out_url: lreProxyOutUrl,
  lre_search_timeslot: lreSearchTimeslot,
  lre_status_by_sla: lreStatusBySla,
  lre_output_dir: lreOutputDir,
  lre_workspace_dir: lreWorkspaceDir,
  lre_enable_stacktrace: lreEnableStacktrace
};

const writeConfigFile = async () => {
  const workspaceDir =
    process.env.PLUGIN_LRE_WORKSPACE_DIR || '/tmp';

  const configFilePath = path.join(workspaceDir, 'config.json');

  await fs.writeFile(
    configFilePath,
    JSON.stringify(config, null, 2),
    { encoding: 'utf-8' }
  );

  return configFilePath;
};

// const triggerMavenApp = (configFilePath: string) => {
  // exec(`mvn -f ../java-app/pom.xml exec:java -Dexec.args="${configFilePath}"`, (error, stdout, stderr) => {
    // if (error) {
      // console.error(`exec error: ${error}`);
      // return;
    // }
    // console.log(`stdout: ${stdout}`);
    // console.error(`stderr: ${stderr}`);
  // });
// };

const triggerJavaJarApp = (configFilePath: string) => {
  return new Promise<void>((resolve, reject) => {
    const jarFilePath = path.resolve(__dirname, 'lre-actions-1.1-SNAPSHOT-jar-with-dependencies.jar');

    const javaAppCommand = 'java';
    const javaAppArgs = ['-jar', jarFilePath, configFilePath];

    const workingDirectory = __dirname;

    const javaProcess = spawn(javaAppCommand, javaAppArgs, { cwd: workingDirectory });

    javaProcess.on('error', (err: any) => {
      console.error('Failed to start Java process:', err);
      reject(err);
    });

    javaProcess.stdout.on('data', (data: any) => {
      console.log(`[JAVA] ${data}`);
    });

    javaProcess.stderr.on('data', (data: any) => {
      console.error(`[JAVA][ERR] ${data}`);
    });

    javaProcess.on('close', (code: any) => {
      if (code !== 0) {
        reject(new Error(`Java process exited with code ${code}`));
      } else {
        console.log('Java process completed successfully.');
        resolve();
      }
    });
  });
};

const main = async () => {
  try {
    const configFilePath = await writeConfigFile();
    await triggerJavaJarApp(configFilePath);  // <-- wait for completion
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

main();
