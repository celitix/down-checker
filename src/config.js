module.exports = {
  checkIntervalMs: 60 * 1000,
  requestTimeoutMs: 10 * 1000,

  websites: [
    {
      name: "Livaro",
      url: "https://livarostudio.com"
    },
    {
      name: "Google",
      url: "https://www.google.com"
    }
  ],

  recipients: [
    {
      name: "Admin",
      phone: "919672670732"
    }
  ],

  alerts: {
    sms: {
      enabled: true,
      endpoint: "https://your-sms-api.example.com/send",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "replace-with-your-sms-api-key"
      }
    },
    whatsapp: {
      enabled: true,
      endpoint: "https://your-whatsapp-api.example.com/send",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "replace-with-your-whatsapp-api-key"
      }
    }
  }
};
