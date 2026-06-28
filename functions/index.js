const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

exports.proxyOpenCodeGo = onCall(async (request) => {
  const { prompt, apiKey } = request.data;

  if (!apiKey) {
    throw new HttpsError("invalid-argument", "Missing API key");
  }

  if (!prompt) {
    throw new HttpsError("invalid-argument", "Missing prompt");
  }

  try {
    const response = await fetch("https://opencode.ai/zen/go/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error("OpenCode Go API Error:", errorData);
      throw new HttpsError("unknown", `API Error: ${response.status}`, errorData);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error in proxyOpenCodeGo:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", error.message);
  }
});
