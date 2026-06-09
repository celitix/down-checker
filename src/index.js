const { loadEnv } = require("./loadEnv");

loadEnv();

const config = require("./config");
const { checkWebsite } = require("./checker");
const { sendDownAlerts } = require("./notifier");

const downSites = new Set();

async function runChecks() {
  console.log(`Running website checks at ${new Date().toISOString()}`);

  for (const website of config.websites) {
    const result = await checkWebsite(website, config.requestTimeoutMs);

    if (result.isUp) {
      console.log(
        `[UP] ${website.name} (${website.url}) - HTTP ${result.statusCode}, ${result.responseTimeMs}ms`
      );
      downSites.delete(website.url);
      continue;
    }

    console.log(`[DOWN] ${website.name} (${website.url}) - ${result.error}`);

    if (downSites.has(website.url)) {
      console.log(`Alert already sent for ${website.name}; waiting for recovery before sending again.`);
      continue;
    }

    downSites.add(website.url);
    await sendDownAlerts(result, config.recipients, config.alerts);
  }
}

async function start() {
  await runChecks();
  setInterval(runChecks, config.checkIntervalMs);
}

start().catch((error) => {
  console.error("Website checker failed:", error);
  process.exitCode = 1;
});
