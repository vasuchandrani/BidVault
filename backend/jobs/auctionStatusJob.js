import cron from "node-cron";
import Auction from "../models/Auction.js";

// Prevent overlapping runs
let isRunning = false;

// How many auctions to update per batch
const BATCH_SIZE = 500;

// Generic batch update helper
async function updateInBatches(filter, update) {
    let skip = 0;
    let updated = 0;

    while (true) {
        const batch = await Auction.find(filter)
            .select("_id")
            .limit(BATCH_SIZE)
            .skip(skip)
            .lean();

        if (batch.length === 0) break;

        const ids = batch.map(a => a._id);

        const result = await Auction.updateMany(
            { _id: { $in: ids } },
            update
        );

        updated += result.modifiedCount;

        if (batch.length < BATCH_SIZE) break;

        skip += BATCH_SIZE;
    }

    return updated;
}

async function runStatusUpdate() {
    if (isRunning) return;
    isRunning = true;

    const now = new Date();
    const startedAt = Date.now();

    try {
        // UPCOMING → LIVE
        const toLive = await updateInBatches(
            {
                verified: true,
                status: "UPCOMING",
                startTime: { $lte: now },
                endTime: { $gt: now },
            },
            { $set: { status: "LIVE" } }
        );

        // UPCOMING → ENDED (missed start)
        const upcomingToEnded = await updateInBatches(
            {
                verified: true,
                status: "UPCOMING",
                endTime: { $lte: now },
            },
            { $set: { status: "ENDED" } }
        );

        // LIVE → ENDED
        const toEnded = await updateInBatches(
            {
                verified: true,
                status: "LIVE",
                endTime: { $lte: now },
            },
            { $set: { status: "ENDED" } }
        );

        const total = toLive + upcomingToEnded + toEnded;
        const duration = Date.now() - startedAt;

        if (total > 0) {
            console.log(
                `[AuctionStatusJob] Updated ${total} ` +
                `(LIVE: ${toLive}, UPC->END: ${upcomingToEnded}, END: ${toEnded}) in ${duration}ms`
            );
        }
    } catch (err) {
        console.error("[AuctionStatusJob] Error:", err);
    } finally {
        isRunning = false;
    }
}

let cronJob = null;

export function startAuctionStatusJob({
    cronPattern = "*/1 * * * *",  // every minute
    runOnStart = true,
} = {}) {
    if (cronJob) return;

    if (!cron.validate(cronPattern)) {
        throw new Error(`Invalid cron pattern: ${cronPattern}`);
    }

    if (runOnStart) {
        runStatusUpdate().catch(console.error);
    }

    cronJob = cron.schedule(
        cronPattern,
        () => runStatusUpdate().catch(console.error),
        { scheduled: true, timezone: "UTC" }
    );

    console.log(`[AuctionStatusJob] Started with pattern ${cronPattern}`);
}

export function stopAuctionStatusJob() {
    if (cronJob) {
        cronJob.stop();
        cronJob = null;
        console.log("[AuctionStatusJob] Stopped");
    }
}

export function getAuctionStatusJobState() {
    return {
        running: Boolean(cronJob),
        processing: isRunning
    };
}