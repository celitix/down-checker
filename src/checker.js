const net = require("net");

function getMonitorTarget(website) {
  if (website.type === "tcp") {
    return `${website.host}:${website.port}`;
  }

  return website.url;
}

function checkTcpConnection(website, timeoutMs) {
  const startedAt = Date.now();

  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isFinished = false;

    function finish(isUp, error = null) {
      if (isFinished) {
        return;
      }

      isFinished = true;
      socket.destroy();

      resolve({
        website,
        isUp,
        statusCode: null,
        responseTimeMs: Date.now() - startedAt,
        checkedAt: new Date().toISOString(),
        error,
        checkType: "tcp",
        target: getMonitorTarget(website),
      });
    }

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false, "TCP connection timeout"));
    socket.once("error", (error) => finish(false, error.message));
    socket.connect(website.port, website.host);
  });
}

async function checkHttpUrl(website, timeoutMs, method) {
  const response = await fetch(website.url, {
    method,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; WebsiteChecker/1.0; +https://localhost)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      ...website.headers,
    },
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
  });

  return response;
}

async function checkWebsite(website, timeoutMs) {
  const startedAt = Date.now();

  if (website.type === "tcp") {
    return checkTcpConnection(website, timeoutMs);
  }

  const method = website.method || "HEAD";

  try {
    let response = await checkHttpUrl(website, timeoutMs, method);

    if (!response.ok && method === "HEAD" && website.fallbackToGet !== false) {
      response = await checkHttpUrl(website, timeoutMs, "GET");
    }

    return {
      website,
      isUp: response.ok,
      statusCode: response.status,
      responseTimeMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
      error: response.ok ? null : `HTTP ${response.status}`,
      checkType: "http",
      method,
      target: getMonitorTarget(website),
    };
  } catch (error) {
    return {
      website,
      isUp: false,
      statusCode: null,
      responseTimeMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
      error: error.message,
      checkType: "http",
      method,
      target: getMonitorTarget(website),
    };
  }
}

module.exports = {
  checkWebsite,
  getMonitorTarget,
};
