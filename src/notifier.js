function buildDownMessageForSMS(result, phone) {
  // return [
  //   "Website down alert",
  //   `Name: ${result.website.name}`,
  //   `URL: ${result.website.url}`,
  //   `Checked at: ${result.checkedAt}`,
  //   `Error: ${result.error || "Unknown error"}`,
  // ].join("\n");

  const message = `Hi Team, Website/App Status Alert: ${result.website.name} Internal Team - PPSPL`;
  const payload = {
    messages: [
      {
        message,
        to: phone,
        senderId: "PPSPL",
        templateId: "1407174947422049627",
        entityId: "1401478660000018667",
        unicode: false,
        clientRefId: "ORDER_1001",
      },
    ],
  };

  return payload;
}

function buildDownMessageForWhatsapp(result, phone) {
  const payload = {
    template: {
      components: [
        {
          type: "BODY",
          parameters: [
            {
              text: result.website.name,
              type: "text",
            },
          ],
        },
      ],
      name: "alertw",
      language: {
        code: "en",
        policy: "deterministic",
      },
    },
    messaging_product: "whatsapp",
    to: phone,
    type: "template",
  };

  return payload;
}

async function postAlert(apiConfig, payload) {
  const response = await fetch(apiConfig.endpoint, {
    method: apiConfig.method,
    headers: apiConfig.headers,
    body: JSON.stringify(payload),
  });

  console.log("response", await response.text());

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Alert API failed with HTTP ${response.status}: ${responseText}`,
    );
  }
}

async function sendSmsAlert(result, recipient, smsConfig) {
  if (!smsConfig.enabled) {
    return;
  }

  await postAlert(smsConfig, buildDownMessageForSMS(result, recipient.phone));
}

async function sendWhatsappAlert(result, recipient, whatsappConfig) {
  if (!whatsappConfig.enabled) {
    return;
  }

  await postAlert(
    whatsappConfig,
    buildDownMessageForWhatsapp(result, recipient.phone),
  );
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
  sendDownAlerts,
};
