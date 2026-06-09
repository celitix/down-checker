module.exports = {
  checkIntervalMs: 60 * 1000,
  requestTimeoutMs: 10 * 1000,

  websites: [
    {
      name: "Livaro",
      url: "https://livarostudio.com",
    },
    {
      name: "Celitix",
      url: "https://www.celitix.com",
    },
    {
      name: "Proactive Digital",
      url: "https://www.proactivedigital.in",
    },
  ],

  recipients: [
    {
      name: "Admin",
      phone: "919672670732",
    },
  ],

  alerts: {
    sms: {
      enabled: true,
      endpoint: "https://api.celitix.com/v1/sms/send",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.SMS_KEY,
      },
    },
    whatsapp: {
      enabled: true,
      endpoint: "https://api.celitix.com/wrapper/waba/message",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        key: process.env.WHATSAPP_KEY,
        wabaNumber: "919251006460",
      },
    },
  },
};
