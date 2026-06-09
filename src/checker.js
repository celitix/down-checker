async function checkWebsite(website, timeoutMs) {
  const startedAt = Date.now();

  try {
    const response = await fetch(website.url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs)
    });

    return {
      website,
      isUp: response.ok,
      statusCode: response.status,
      responseTimeMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
      error: response.ok ? null : `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      website,
      isUp: false,
      statusCode: null,
      responseTimeMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
      error: error.message
    };
  }
}

module.exports = {
  checkWebsite
};
