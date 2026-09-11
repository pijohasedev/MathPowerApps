const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const handleAiProxy = async (request) => {
  const { prompt, apiKey, provider = "tokenharbor", model, baseUrl } = request.data || {};

  if (!apiKey) {
    throw new HttpsError("invalid-argument", "Kunci API (API Key) diperlukan.");
  }

  if (!prompt) {
    throw new HttpsError("invalid-argument", "Prompt soalan diperlukan.");
  }

  // Tentukan URL sasaran dan model lalai mengikut provider
  let targetUrl = "";
  let defaultModel = "mimo-v2.5";

  if (provider === "tokenharbor") {
    targetUrl = "https://tokenharbor.ai/v1/chat/completions";
    defaultModel = "mimo-v2.5";
  } else if (provider === "opencode") {
    targetUrl = "https://opencode.ai/zen/go/v1/chat/completions";
    defaultModel = "deepseek-v4-flash";
  } else if (provider === "custom") {
    if (!baseUrl) {
      throw new HttpsError("invalid-argument", "Base URL diperlukan untuk provider Kustom.");
    }
    const cleanBase = baseUrl.trim().replace(/\/+$/, "");
    targetUrl = cleanBase.endsWith("/chat/completions") ? cleanBase : `${cleanBase}/chat/completions`;
    defaultModel = model || "mimo-v2.5";
  } else {
    // Lalai kepada Token Harbor
    targetUrl = "https://tokenharbor.ai/v1/chat/completions";
    defaultModel = "mimo-v2.5";
  }

  const targetModel = (model && model.trim()) ? model.trim() : defaultModel;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error(`AI Gateway Error (${provider}):`, { status: response.status, error: errorData });
      const errorMsg = errorData?.error?.message || errorData?.message || `HTTP ${response.status}`;
      throw new HttpsError("unknown", `API Error (${response.status}): ${errorMsg}`, errorData);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error in AI Proxy:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", error.message);
  }
};

// Proksi AI Utama
exports.proxyAi = onCall(handleAiProxy);

// Alias untuk keserasian ke belakang
exports.proxyTokenHarbor = onCall(handleAiProxy);
exports.proxyOpenCodeGo = onCall(handleAiProxy);
