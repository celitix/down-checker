function buildDownMessageForSMS(result, phone) {
  // return [
  //   "Website down alert",
  //   `Name: ${result.website.name}`,
  //   `URL: ${result.website.url}`,
  //   `Checked at: ${result.checkedAt}`,
  //   `Error: ${result.error || "Unknown error"}`,
  // ].join("\n");

  const message = buildStatusMessage(result);
  const payload = {
    messages: [
      {
        message,
        to: phone,
        senderId: process.env.PROSMS_SENDER_ID,
        templateId: process.env.PROSMS_TEMPLATE_ID,
        entityId: process.env.PROSMS_ENTITY_ID,
        unicode: false,
        clientRefId: "ORDER_1001",
      },
    ],
  };

  return payload;
}

function buildStatusMessage(result) {
  return `Hi Team, Website/App Status Alert: ${result.website.name} is ${result.isUp ? "UP" : "DOWN"} Internal Team - PPSPL`;
}

function getHostname(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch (error) {
    return "";
  }
}

function getMonitorHostname(website) {
  if (website.type === "tcp") {
    return String(website.host || "").toLowerCase();
  }

  return getHostname(website.url);
}

function shouldUseFallbackSms(result, fallbackSmsConfig) {
  if (!fallbackSmsConfig || !fallbackSmsConfig.enabled || result.isUp) {
    return false;
  }

  return (
    getMonitorHostname(result.website) ===
    fallbackSmsConfig.downOnlyHost.toLowerCase()
  );
}

function buildDownMessageForWhatsapp(result, phone) {
  const payload = {
    template: {
      components: [
        {
          type: "BODY",
          parameters: [
            {
              text: `${result.website.name} ${result.isUp ? "is UP" : "is DOWN"}`,
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

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Alert API failed with HTTP ${response.status}: ${responseText}`,
    );
  }
}

async function sendFallbackSmsAlert(result, recipient, fallbackSmsConfig) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(fallbackSmsConfig.query)) {
    if (value) {
      params.set(key, value);
    }
  }

  params.set("mobiles", `+${recipient.phone}`);
  params.set("sms", buildStatusMessage(result));

  const response = await fetch(
    `${fallbackSmsConfig.endpoint}?${params.toString()}`,
  );

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Fallback SMS API failed with HTTP ${response.status}: ${responseText}`,
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

async function sendStatusAlerts(result, recipients, alertsConfig) {
  const tasks = [];
  const useFallbackSms = shouldUseFallbackSms(result, alertsConfig.fallbackSms);

  for (const recipient of recipients) {
    if (useFallbackSms) {
      tasks.push(
        sendFallbackSmsAlert(result, recipient, alertsConfig.fallbackSms),
      );
      continue;
    }

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
  sendStatusAlerts,
};
