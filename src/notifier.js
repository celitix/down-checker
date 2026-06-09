function buildDownMessageForSMS(result) {
  return [
    "Website down alert",
    `Name: ${result.website.name}`,
    `URL: ${result.website.url}`,
    `Checked at: ${result.checkedAt}`,
    `Error: ${result.error || "Unknown error"}`
  ].join("\n");
}

function buildDownMessageForWhatsapp(result) {
  return [
    "Website down alert",
    `Name: ${result.website.name}`,
    `URL: ${result.website.url}`,
    `Checked at: ${result.checkedAt}`,
    `Error: ${result.error || "Unknown error"}`
  ].join("\n");
}

async function postAlert(apiConfig, payload) {
  const response = await fetch(apiConfig.endpoint, {
    method: apiConfig.method,
    headers: apiConfig.headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Alert API failed with HTTP ${response.status}: ${responseText}`);
  }
}

async function sendSmsAlert(result, recipient, smsConfig) {
  if (!smsConfig.enabled) {
    return;
  }

  await postAlert(smsConfig, {
    to: recipient.phone,
    message: buildDownMessageForSMS(result)
  });
}

async function sendWhatsappAlert(result, recipient, whatsappConfig) {
  if (!whatsappConfig.enabled) {
    return;
  }

  await postAlert(whatsappConfig, {
    to: recipient.phone,
    message: buildDownMessageForWhatsapp(result)
  });
}

async function sendDownAlerts(result, recipients, alertsConfig) {
  const tasks = [];

  for (const recipient of recipients) {
    tasks.push(sendSmsAlert(result, recipient, alertsConfig.sms));
    tasks.push(sendWhatsappAlert(result, recipient, alertsConfig.whatsapp));
  }

  await Promise.allSettled(tasks).then((results) => {
    for (const alertResult of results) {
      if (alertResult.status === "rejected") {
        console.error("Alert send failed:", alertResult.reason.message);
      }
    }
  });
}

module.exports = {
  sendDownAlerts
};
