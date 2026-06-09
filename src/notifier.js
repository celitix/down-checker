function buildDownMessageForSMS(result, phone) {
  // return [
  //   "Website down alert",
  //   `Name: ${result.website.name}`,
  //   `URL: ${result.website.url}`,
  //   `Checked at: ${result.checkedAt}`,
  //   `Error: ${result.error || "Unknown error"}`,
  // ].join("\n");

  const message = `Your One Time Password for healthsquare.in is ${result.website.name} valid for ${result.website.url}. Do not share this with anyone.`;
  const payload = {
    messages: [
      {
        message,
        to: phone,
        senderId: "HLTSQR",
        templateId: "1707176542867924468",
        entityId: "1401676480000010217",
        unicode: false,
        clientRefId: "ORDER_1001",
      },
    ],
  };

  return payload;
}

function buildDownMessageForWhatsapp(result, phone) {
  // return [
  //   "Website down alert",
  //   `Name: ${result.website.name}`,
  //   `URL: ${result.website.url}`,
  //   `Checked at: ${result.checkedAt}`,
  //   `Error: ${result.error || "Unknown error"}`
  // ].join("\n");

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phone,
    type: "template",
    template: {
      name: "sample_cpr_templatenew",
      language: {
        code: "en",
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: result.website.name,
            },
            {
              type: "text",
              text: result.website.url,
            },
          ],
        },
      ],
    },
  };

  return payload;
}

async function postAlert(apiConfig, payload) {
  const response = await fetch(apiConfig.endpoint, {
    method: apiConfig.method,
    headers: apiConfig.headers,
    body: JSON.stringify(payload),
  });

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
