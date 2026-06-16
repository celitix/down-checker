// module.exports = {
//   checkIntervalMs: 30 * 1000,
//   alertResendIntervalMs: 30 * 60 * 1000,
//   requestTimeoutMs: 10 * 1000,

//   websites: [
//     {
//       name: "Proactive_APP",
//       url: "https://www.proactivesms.in",
//       recipientIds: ["support_1", "support_2"],
//     },
//     {
//       name: "Celitix Website",
//       url: "https://www.celitix.com",
//       recipientIds: ["aman_1", "aman_2", "support_1", "support_2"],
//     },
//     {
//       name: "Celitix_APP",
//       url: "https://app.celitix.com",
//       recipientIds: ["aman_1", "aman_2", "support_1", "support_2"],
//     },
//     {
//       name: "Proactive Digital Website",
//       url: "https://www.proactivedigital.in",
//       recipientIds: ["support_1"],
//     },
//     {
//       name: "Celitix_IP",
//       url: "http://35.154.166.140",
//       // url: "https://api.celitix.com",
//       recipientIds: ["support_1", "support_2", "prateek"],
//     },
//     {
//       name: "TCP_8001",
//       type: "tcp",
//       host: "65.1.58.141",
//       port: 8001,
//       recipientIds: ["support_1", "support_2", "prateek"],
//     },
//     {
//       name: "Bot Impressive",
//       url: "https://bot.celitix.com/impressive",
//       recipientIds: ["support_1"],
//     },
//     {
//       name: "Bot Full Marks",
//       url: "https://bot.celitix.com/full_marks",
//       recipientIds: ["support_1"],
//     },
//     {
//       name: "Thamosa Stays",
//       url: "https://thamosastays.com",
//       recipientIds: ["support_1"],
//     },
//   ],

//   recipients: [
//     {
//       id: "aman_1",
//       name: "Aman Sir 1",
//       phone: "919680002299",
//     },
//     {
//       id: "aman_2",
//       name: "Aman Sir 2",
//       phone: "919680002000",
//     },
//     {
//       id: "support_1",
//       name: "Support 1",
//       phone: "919680006460",
//     },
//     {
//       id: "support_2",
//       name: "Support 2",
//       phone: "919251006460",
//     },
//     {
//       id: "prateek",
//       name: "Prateek Sir",
//       phone: "919680003399",
//     },
//     // {
//     //   name: "Arihant",
//     //   phone: "917665576953",
//     // },
//   ],

//   alerts: {
//     sms: {
//       enabled: true,
//       endpoint: "https://api.celitix.com/v1/sms/send",
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-api-key": process.env.API_KEY,
//       },
//     },
//     whatsapp: {
//       enabled: true,
//       endpoint: "https://api.celitix.com/wrapper/waba/message",
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         key: process.env.API_KEY,
//         wabaNumber: process.env.WHATSAPP_NUMBER,
//       },
//     },
//     fallbackSms: {
//       enabled: true,
//       downOnlyHost: "api.celitix.com",
//       endpoint: "https://www.proactivesms.in/sendsms.jsp",
//       query: {
//         user: process.env.PROSMS_USER || "prosms",
//         password: process.env.PROSMS_PASSWORD,
//         senderid: process.env.PROSMS_SENDER_ID,
//         entityid: process.env.PROSMS_ENTITY_ID,
//         tempid: process.env.PROSMS_TEMPLATE_ID,
//       },
//     },
//   },
// };

module.exports = {
  checkIntervalMs: 30 * 1000,
  requestTimeoutMs: 10 * 1000,
  alertResendIntervalMs: 10 * 60 * 1000,
  downConfirmationChecks: 2,
  downConfirmationDelayMs: 10 * 1000,
  upConfirmationChecks: 2,

  websites: [
    {
      name: "Proactive_APP",
      url: "https://www.proactivesms.in",
      recipientIds: ["aman_1", "aman_2", "support_1", "support_2", "prateek"],
    },
    {
      name: "Celitix Website",
      url: "https://www.celitix.com",
      recipientIds: ["prateek", "aman_2", "support_1", "support_2"],
    },
    {
      name: "Celitix_APP",
      url: "http://3.111.160.66",
      recipientIds: ["aman_1", "aman_2", "support_1", "support_2", "prateek"],
    },
    {
      name: "Proactive Digital Website",
      url: "https://www.proactivedigital.in",
      recipientIds: ["support_1", "prateek"],
    },
    {
      name: "Celitix_Reseller_IP",
      url: "http://35.154.166.140",
      // url: "https://api.celitix.com",
      recipientIds: ["aman_1", "aman_2", "support_1", "support_2", "prateek"],
    },
    {
      name: "TCP_8001",
      type: "tcp",
      host: "65.1.58.141",
      port: 8001,
      recipientIds: ["aman_1", "aman_2", "support_1", "support_2", "prateek"],
    },
    {
      name: "Bot Impressive",
      url: "https://bot.celitix.com/impressive",
      recipientIds: ["support_1", "support_2", "prateek"],
    },
    {
      name: "Bot Full Marks",
      url: "https://bot.celitix.com/full_marks",
      recipientIds: ["support_1", "support_2", "prateek"],
    },
    {
      name: "Thamosa Stays",
      url: "https://thamosastays.com",
      recipientIds: ["prateek"],
    },

    {
      name: "WABA Now",
      url: "https://wabanow.com/",
      method: "HEAD",
      timeoutMs: 45 * 1000,
      recipientIds: ["prateek", "dial", "aman_1"],
    },
    {
      name: "SMS HG Info",
      url: "https://mobizz.hginfosys.co.in/",
      recipientIds: ["prateek", "hginfo", "aman_1", "Vasim"],
    },
  ],

  recipients: [
    {
      id: "aman_1",
      name: "Aman Sir 1",
      phone: "919680002299",
    },
    {
      id: "aman_2",
      name: "Aman Sir 2",
      phone: "919680002000",
    },
    {
      id: "support_1",
      name: "Support 1",
      phone: "919680006460",
    },
    {
      id: "support_2",
      name: "Support 2",
      phone: "919251006460",
    },
    {
      id: "prateek",
      name: "Prateek Sir",
      phone: "919680003399",
    },
    {
      id: "dial",
      name: "Monu_Sir",
      phone: "919829088048",
    },
    {
      id: "hginfo",
      name: "Ankit_Sir",
      phone: "919910630073",
    },
    {
      id: "Vasim",
      name: "HG_Sir",
      phone: "919913850577",
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
    fallbackSms: {
      enabled: true,
      downOnlyHost: "3.111.160.66",
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
