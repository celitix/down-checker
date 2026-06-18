function buildDownMessageForRecipients(result, recipients) {
  const message = buildStatusMessage(result);
  const checkedAt = result.checkedAt.replace(/\D/g, "");
  const websiteRef = result.website.name.replace(/[^a-z0-9]/gi, "_");

  return {
    messages: recipients.map((recipient) => ({
      message,
      to: recipient.phone,
      senderId: process.env.PROSMS_SENDER_ID,
      templateId: process.env.PROSMS_TEMPLATE_ID,
      entityId: process.env.PROSMS_ENTITY_ID,
      unicode: false,
      clientRefId: `STATUS_${websiteRef}_${checkedAt}_${recipient.id}`,
    })),
  };
}

function buildStatusMessage(result) {
  return `Hi Team,\n\nWebsite/App Status Alert: ${result.website.name} is ${result.isUp ? "UP" : "DOWN"}\n\n Internal Team - PPSPL`;
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

async function sendFallbackSmsAlerts(result, recipients, fallbackSmsConfig) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(fallbackSmsConfig.query)) {
    if (value) {
      params.set(key, value);
    }
  }

  params.set(
    "mobiles",
    recipients.map((recipient) => `+${recipient.phone}`).join(","),
  );
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

async function sendSmsAlerts(result, recipients, smsConfig) {
  if (!smsConfig.enabled) {
    return;
  }

  await postAlert(smsConfig, buildDownMessageForRecipients(result, recipients));
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

  if (recipients.length === 0) {
    return [];
  }

  if (useFallbackSms) {
    tasks.push({
      recipientPhones: recipients.map((recipient) => recipient.phone),
      promise: sendFallbackSmsAlerts(
        result,
        recipients,
        alertsConfig.fallbackSms,
      ),
    });
  } else {
    if (alertsConfig.sms.enabled) {
      tasks.push({
        recipientPhones: recipients.map((recipient) => recipient.phone),
        promise: sendSmsAlerts(result, recipients, alertsConfig.sms),
      });
    }

    if (alertsConfig.whatsapp.enabled) {
      for (const recipient of recipients) {
        tasks.push({
          recipientPhones: [recipient.phone],
          promise: sendWhatsappAlert(result, recipient, alertsConfig.whatsapp),
        });
      }
    }
  }

  if (tasks.length === 0) {
    return [];
  }

  const sentPhones = new Set();
  const results = await Promise.allSettled(tasks.map((task) => task.promise));

  for (const [index, alertResult] of results.entries()) {
    if (alertResult.status === "rejected") {
      console.error("Alert send failed:", alertResult.reason.message);
      continue;
    }

    for (const phone of tasks[index].recipientPhones) {
      sentPhones.add(phone);
    }
  }

  return Array.from(sentPhones);
}

module.exports = {
  sendStatusAlerts,
};
