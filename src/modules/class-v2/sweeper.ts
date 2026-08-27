import {ClassV2Service} from "./service";
import {logger} from "../../common/logger";

const SWEEPER_INTERVAL_MS = 60 * 60 * 1000; // Run every 1 hour

let sweeperTimer: NodeJS.Timeout | null = null;
let isSweeperRunning = false;

/**
 * Executes a single sweep cycle to reconcile unattended Class V2 sessions.
 */
export const runClassV2SweeperOnce = async (): Promise<number> => {
    if (isSweeperRunning) {
        logger.warn("Class V2 Attendance Sweeper is already running, skipping overlapping cycle");
        return 0;
    }

    isSweeperRunning = true;
    try {
        const markedAbsentCount = await ClassV2Service.reconcileUnattendedClasses();
        if (markedAbsentCount > 0) {
            logger.info("Class V2 Attendance Sweeper reconciled expired classes", {
                markedAbsentCount,
            });
        }
        return markedAbsentCount;
    } catch (error) {
        logger.error("Class V2 Attendance Sweeper encountered an error during reconciliation", {
            error,
        });
        return 0;
    } finally {
        isSweeperRunning = false;
    }
};

/**
 * Starts the in-process periodic sweeper.
 * Runs once immediately on invocation (to catch up after downtime)
 * and subsequently every 1 hour.
 */
export const startClassV2Sweeper = (intervalMs = SWEEPER_INTERVAL_MS): void => {
    if (sweeperTimer) {
        logger.warn("Class V2 Attendance Sweeper is already initialized");
        return;
    }

    logger.info("Initializing Class V2 Attendance Sweeper", {
        intervalHours: intervalMs / (60 * 60 * 1000),
    });

    // Run immediately on startup to reconcile any classes from server downtime
    runClassV2SweeperOnce().catch((err) => {
        logger.error("Initial startup run of Class V2 Sweeper failed", {err});
    });

    // Schedule periodic execution every 1 hour
    sweeperTimer = setInterval(() => {
        runClassV2SweeperOnce().catch((err) => {
            logger.error("Scheduled run of Class V2 Sweeper failed", {err});
        });
    }, intervalMs);

    // Allow node to exit gracefully if only this timer is running
    sweeperTimer.unref();
};

/**
 * Stops the periodic sweeper timer.
 */
export const stopClassV2Sweeper = (): void => {
    if (sweeperTimer) {
        clearInterval(sweeperTimer);
        sweeperTimer = null;
        logger.info("Class V2 Attendance Sweeper stopped");
    }
};
