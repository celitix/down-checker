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
    {
      name: "Health Square",
      url: "https://healthsquare.com",
    },
    {
      name: "Bot Celitix Impressive",
      url: "https://bot.celitix.com/impressive",
    },
    {
      name: "Bot Celitix Full Marks",
      url: "https://bot.celitix.com/full_marks",
    },
    {
      name: "Thamosa Stays",
      url: "https://thamosastays.com",
    },
  ],

  recipients: [
    {
      name: "Aman Sir 1",
      phone: "919680002299",
    },
    {
      name: "Aman Sir 2",
      phone: "919680002000",
    },
    {
      name: "Support 1",
      phone: "919680006460",
    },
    {
      name: "Support 2",
      phone: "919251006460",
    },
    {
      name: "Prateek Sir",
      phone: "919680003399",
    },
  ],

  alerts: {
    sms: {
      enabled: true,
      endpoint: "https://api.celitix.com/v1/sms/send",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY,
      },
    },
    whatsapp: {
      enabled: true,
      endpoint: "https://api.celitix.com/wrapper/waba/message",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        key: process.env.API_KEY,
        wabaNumber: process.env.WHATSAPP_NUMBER,
      },
    },
  },
};
