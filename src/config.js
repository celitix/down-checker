module.exports = {
  checkIntervalMs: 30 * 1000,
  requestTimeoutMs: 10 * 1000,

  websites: [
    {
      name: "Proactive_APP",
      url: "https://www.proactivesms.in",
    },
    {
      name: "Celitix Website",
      url: "https://www.celitix.com",
    },
    {
      name: "Celitix_APP",
      url: "https://app.celitix.com",
    },
    {
      name: "Proactive Digital Website",
      url: "https://www.proactivedigital.in",
    },
    {
      name: "Celitix_IP",
      // url: "http://35.154.166.140",
      url: "https://api.celitix.com",
    },
    {
      name: "Bot Impressive",
      url: "https://bot.celitix.com/impressive",
    },
    {
      name: "Bot Full Marks",
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
    // {
    //   name: "Arihant",
    //   phone: "917665576953",
    // },
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
    fallbackSms: {
      enabled: true,
      downOnlyHost: "api.celitix.com",
      endpoint: "https://www.proactivesms.in/sendsms.jsp",
      query: {
        user: process.env.PROSMS_USER || "prosms",
        password: process.env.PROSMS_PASSWORD,
        senderid: process.env.PROSMS_SENDER_ID,
        entityid: process.env.PROSMS_ENTITY_ID,
        tempid: process.env.PROSMS_TEMPLATE_ID,
      },
    },
  },
};
