package com.opentext.lre.actions;

import com.opentext.lre.actions.common.helpers.InputRetriever;
import com.opentext.lre.actions.common.helpers.LocalizationManager;
import com.opentext.lre.actions.common.helpers.utils.DateFormatter;
import com.opentext.lre.actions.common.helpers.utils.LogHelper;
import com.opentext.lre.actions.runtest.LreTestRunBuilder;
import com.opentext.lre.actions.runtest.LreTestRunModel;

import java.io.File;
import java.io.IOException;
import java.net.ServerSocket;
import java.nio.file.Paths;

import static com.opentext.lre.actions.runtest.LreTestRunBuilder.artifactsResourceName;

public class Main {

    private static final int PORT = 57395;
    private static ServerSocket serverSocket;
    private static LreTestRunModel lreTestRunModel;

    public static void main(String[] args) throws Exception {
        int exit;
        // Check if another instance is already running
        if (!checkForRunningInstance()) {
            // If not, proceed with initialization and operational code
            initEnvironmentVariables(args);
            exit = performOperations();
        } else {
            // If another instance is already running, exit gracefully
            System.err.println("Another instance is already running.");
            exit = 1;
        }
        releaseSocket();
        System.exit(exit);
    }

    private static boolean checkForRunningInstance() {
        try {
            if(serverSocket == null) { // if socket is not null, socket was previously caught by current instance
                serverSocket = new ServerSocket(PORT);
            }
            return false; // No other instance is running
        } catch (IOException e) {
            // Another instance is already running
            return true;
        }
    }

    private static void releaseSocket() {
        try {
            if (serverSocket != null) {
                serverSocket.close();
            }
        } catch (IOException ignored) {
        }
    }

    private static void initEnvironmentVariables(String[] args) throws Exception {
        InputRetriever inputRetriever = new InputRetriever(args);
        lreTestRunModel = inputRetriever.getLreTestRunModel();
    }

    private static int performOperations() {
        int exit = 0;
        try {
            if (lreTestRunModel != null) {
                DateFormatter dateFormatter = new DateFormatter("_E_yyyy_MMM_dd_'at'_HH_mm_ss_SSS_a_zzz");
                String logFileName = "lre_run_test_" + dateFormatter.getDate() + ".log";
                File logFile = new File(Paths.get(lreTestRunModel.getWorkspace(), artifactsResourceName, logFileName).toString());
                if (!logFile.getParentFile().exists() && !logFile.getParentFile().mkdirs()) {
                    throw new IOException("Could not create log directory: " + logFile.getParentFile());
                }
                String logFilePath = logFile.getAbsolutePath();
                System.setProperty("log.file", logFilePath);
                LogHelper.setup(logFilePath, lreTestRunModel.isEnableStacktrace());
                LogHelper.log(LocalizationManager.getString("BeginningLRETestExecution"), true);
                // Run the main builder
                LreTestRunBuilder lreTestRunBuilder = new LreTestRunBuilder(lreTestRunModel);
                boolean buildSuccess = lreTestRunBuilder.perform();
                if (buildSuccess) {
                    LogHelper.log("Build successful", true);
                } else {
                    exit = 1;
                    LogHelper.error("Build failed");
                }
            } else {
                exit = 1;
                LogHelper.error(LocalizationManager.getString("SkippingEverything"));
            }
            LogHelper.log(LocalizationManager.getString("ThatsAllFolks"), true);
        } catch (Exception ex) {
            exit = 1;
            LogHelper.logStackTrace(ex);
        }
        return exit;
    }
}
