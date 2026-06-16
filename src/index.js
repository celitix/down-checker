const { loadEnv } = require("./loadEnv");

loadEnv();

const config = require("./config");
const { checkWebsite, getMonitorTarget } = require("./checker");
const { sendStatusAlerts } = require("./notifier");

const monitorStates = new Map();
let isRunning = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRecipientsForWebsite(website) {
  if (!Array.isArray(website.recipientIds) || website.recipientIds.length === 0) {
    return config.recipients;
  }

  const recipientsById = new Map(
    config.recipients.map((recipient) => [recipient.id, recipient]),
  );

  const recipients = website.recipientIds
    .map((recipientId) => recipientsById.get(recipientId))
    .filter(Boolean);

  if (recipients.length === 0) {
    console.warn(
      `No matching recipients found for ${website.name}; alert will not be sent.`,
    );
  }

  return recipients;
}

async function runChecks() {
  if (isRunning) {
    console.log("Previous website check is still running; skipping this cycle.");
    return;
  }

  isRunning = true;
  console.log(`Running website checks at ${new Date().toISOString()}`);

  try {
    for (const website of config.websites) {
      const monitorTarget = getMonitorTarget(website);
      const timeoutMs = website.timeoutMs || config.requestTimeoutMs;
      let result = await checkWebsite(website, timeoutMs);
      const state = monitorStates.get(monitorTarget) || {
        status: "up",
        consecutiveDownChecks: 0,
        consecutiveUpChecks: 0,
        lastAlertSentAt: null,
      };

      if (result.isUp) {
        state.consecutiveUpChecks += 1;
        state.consecutiveDownChecks = 0;

        console.log(
          `[UP] ${website.name} (${monitorTarget}) - ${result.checkType.toUpperCase()} ${result.method || ""} ${result.statusCode || "OK"}, ${result.responseTimeMs}ms`,
        );

        if (
          state.status === "down" &&
          state.consecutiveUpChecks >= config.upConfirmationChecks
        ) {
          console.log(`${website.name} recovered; sending UP alert.`);
          monitorStates.delete(monitorTarget);
          await sendStatusAlerts(
            result,
            getRecipientsForWebsite(website),
            config.alerts,
          );
        } else {
          monitorStates.set(monitorTarget, state);
        }

        continue;
      }

      state.consecutiveDownChecks += 1;
      state.consecutiveUpChecks = 0;
      monitorStates.set(monitorTarget, state);

      console.log(`[DOWN] ${website.name} (${monitorTarget}) - ${result.error}`);

      if (
        state.status !== "down" &&
        state.consecutiveDownChecks < config.downConfirmationChecks
      ) {
        console.log(
          `${website.name} failed ${state.consecutiveDownChecks}/${config.downConfirmationChecks} checks; checking again in ${config.downConfirmationDelayMs / 1000} seconds.`,
        );

        await sleep(config.downConfirmationDelayMs);
        result = await checkWebsite(website, timeoutMs);

        if (result.isUp) {
          console.log(
            `[UP] ${website.name} (${monitorTarget}) recovered on confirmation check; no DOWN alert sent.`,
          );
          state.consecutiveDownChecks = 0;
          state.consecutiveUpChecks = 1;
          monitorStates.set(monitorTarget, state);
          continue;
        }

        state.consecutiveDownChecks += 1;
        monitorStates.set(monitorTarget, state);
        console.log(
          `[DOWN] ${website.name} (${monitorTarget}) confirmed after ${config.downConfirmationDelayMs / 1000} seconds - ${result.error}`,
        );
      }

      if (
        state.status === "down" &&
        state.lastAlertSentAt &&
        Date.now() - state.lastAlertSentAt < config.alertResendIntervalMs
      ) {
        const nextAlertAt = new Date(
          state.lastAlertSentAt + config.alertResendIntervalMs,
        ).toISOString();
        console.log(
          `Alert already sent for ${website.name}; next repeat after ${nextAlertAt}.`,
        );
        continue;
      }

      state.status = "down";
      state.lastAlertSentAt = Date.now();
      monitorStates.set(monitorTarget, state);

      await sendStatusAlerts(
        result,
        getRecipientsForWebsite(website),
        config.alerts,
      );
    }
  } finally {
    isRunning = false;
  }
}

async function start() {
  monitorStates.clear();
  console.log("Monitor state cleared on startup.");

  await runChecks();
  setInterval(runChecks, config.checkIntervalMs);
}

start().catch((error) => {
  console.error("Website checker failed:", error);
  process.exitCode = 1;
});
