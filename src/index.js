const { loadEnv } = require("./loadEnv");

loadEnv();

const config = require("./config");
const { checkWebsite, getMonitorTarget } = require("./checker");
const { sendStatusAlerts } = require("./notifier");

const downSites = new Map();

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
  console.log(`Running website checks at ${new Date().toISOString()}`);
  const now = Date.now();

  for (const website of config.websites) {
    const monitorTarget = getMonitorTarget(website);
    const result = await checkWebsite(website, config.requestTimeoutMs);

    if (result.isUp) {
      console.log(
        `[UP] ${website.name} (${monitorTarget}) - ${result.checkType.toUpperCase()} ${result.statusCode || "OK"}, ${result.responseTimeMs}ms`,
      );

      if (downSites.has(monitorTarget)) {
        console.log(`${website.name} recovered; sending UP alert.`);
        downSites.delete(monitorTarget);
        await sendStatusAlerts(
          result,
          getRecipientsForWebsite(website),
          config.alerts,
        );
      }

      continue;
    }

    console.log(`[DOWN] ${website.name} (${monitorTarget}) - ${result.error}`);

    const lastAlertSentAt = downSites.get(monitorTarget);

    if (
      lastAlertSentAt &&
      now - lastAlertSentAt < config.alertResendIntervalMs
    ) {
      const nextAlertAt = new Date(
        lastAlertSentAt + config.alertResendIntervalMs,
      ).toISOString();
      console.log(
        `Alert already sent for ${website.name}; next repeat after ${nextAlertAt}.`,
      );
      continue;
    }

    downSites.set(monitorTarget, now);
    await sendStatusAlerts(
      result,
      getRecipientsForWebsite(website),
      config.alerts,
    );
  }
}

async function start() {
  downSites.clear();
  console.log("Down website state cleared on startup.");

  await runChecks();
  setInterval(runChecks, config.checkIntervalMs);
}

start().catch((error) => {
  console.error("Website checker failed:", error);
  process.exitCode = 1;
});
