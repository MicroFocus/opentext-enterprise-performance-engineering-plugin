package com.opentext.lre.actions.common.helpers.utils;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.core.LoggerContext;
import org.apache.logging.log4j.core.config.Configuration;
import org.apache.logging.log4j.core.layout.PatternLayout;
import org.apache.logging.log4j.core.appender.FileAppender;

import java.io.File;

public class LogHelper {

    private static Logger logger;
    private static boolean stackTraceEnabled = false;

    public static synchronized void setup(String logFilePath, boolean enableStackTrace) throws Exception {
        stackTraceEnabled = enableStackTrace;

        // Ensure directory exists
        File file = new File(logFilePath);
        File parent = file.getParentFile();
        if (!parent.exists() && !parent.mkdirs()) {
            throw new Exception("Failed to create log directory: " + parent.getAbsolutePath());
        }

        LoggerContext context = (LoggerContext) LogManager.getContext(false);
        Configuration config = context.getConfiguration();

        PatternLayout layout = PatternLayout.newBuilder()
                .withPattern("%d{yyyy-MM-dd HH:mm:ss} %-5level %logger{36} - %msg%n")
                .withConfiguration(config)
                .build();
        FileAppender fileAppender = FileAppender.newBuilder()
                .withFileName(logFilePath)
                .withName("MainFileAppender")
                .withLayout(layout)
                .withAppend(true)
                .withImmediateFlush(true)
                .withConfiguration(config)
                .build();
        fileAppender.start();

        // Assign logger
        logger = LogManager.getLogger(LogHelper.class);

        logger.info("Log file path set to: " + logFilePath);
    }

    public static void log(String message, boolean addDate, Object... args) {
        logger.info(String.format(message, args));
    }

    public static void error(String message) {
        logger.error(message);
    }

    public static void error(String message, Throwable throwable) {
        if (stackTraceEnabled && throwable != null) {
            logger.error(message, throwable);
        } else if (throwable != null && throwable.getMessage() != null) {
            logger.error(message + " - " + throwable.getMessage());
        } else {
            logger.error(message);
        }
    }

    public static void logStackTrace(Throwable throwable) {
        if (stackTraceEnabled || (throwable != null && throwable.getMessage() == null)) {
            logger.error("Error - Stack Trace: ", throwable);
        } else if (throwable != null) {
            logger.error(throwable.getMessage());
        }
    }
    public static void logStackTrace(String errorMessage, Throwable throwable) {
        if(stackTraceEnabled || (throwable != null && throwable.getMessage().trim().isEmpty())) {
            logger.error("Error: " + errorMessage + " Stack Trace: ", throwable);
        } else if(throwable != null) {
            logger.error(errorMessage + " - " + throwable.getMessage());
        }
    }
}
