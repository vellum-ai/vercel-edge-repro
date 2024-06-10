import { describe, expect, it } from "vitest";
import {
  openAIConfig,
  withAzureBackend,
  withHelicone,
  withOpenAIBackend,
} from "./builder";

describe("OpenAI configuration builder", () => {
  const azureDomain = "your-azure-domain";
  const azureApiKey = "your-azure-api-key";
  const openaiApiKey = "your-openai-api-key";
  const heliconeApiKey = "your-helicone-api-key";
  const requestID = "your-request-id";
  const userID = "your-user-id";

  it("should configure Azure backend correctly", () => {
    const config = openAIConfig(
      withAzureBackend(
        { apiKey: azureApiKey, domain: azureDomain },
        withHelicone({ apiKey: heliconeApiKey, userID, requestID }),
      ),
    );
    expect(config.baseURL).toBe(
      "https://oai.hconeai.com/openai/deployments/gpt-3.5-turbo",
    );
    expect(config.defaultHeaders).toEqual({
      "Helicone-OpenAI-API-Base": `https://${azureDomain}.openai.azure.com`,
      "api-key": azureApiKey,
      "Helicone-Auth": `Bearer ${heliconeApiKey}`,
      "Helicone-User-Id": userID,
      "Helicone-Request-Id": requestID,
    });
  });

  it("should configure Azure backend correctly with a custom model", () => {
    const config = openAIConfig(
      withAzureBackend(
        { apiKey: azureApiKey, domain: azureDomain, model: "gpt-3.5-turbo" },
        withHelicone({ apiKey: heliconeApiKey, userID, requestID }),
      ),
    );
    expect(config.baseURL).toBe(
      "https://oai.hconeai.com/openai/deployments/gpt-3.5-turbo",
    );
    expect(config.defaultHeaders).toEqual({
      "Helicone-OpenAI-API-Base": `https://${azureDomain}.openai.azure.com`,
      "api-key": azureApiKey,
      "Helicone-Auth": `Bearer ${heliconeApiKey}`,
      "Helicone-User-Id": userID,
      "Helicone-Request-Id": requestID,
    });
  });

  it("should configure OpenAI backend correctly", () => {
    const config = openAIConfig(
      withOpenAIBackend(
        { apiKey: openaiApiKey },
        withHelicone({ apiKey: heliconeApiKey, userID, requestID }),
      ),
    );
    expect(config.baseURL).toBe("https://oai.hconeai.com/v1");
    expect(config.apiKey).toBe(openaiApiKey);
    expect(config.defaultHeaders).toEqual({
      "Helicone-Auth": `Bearer ${heliconeApiKey}`,
      "Helicone-User-Id": userID,
      "Helicone-Request-Id": requestID,
    });
  });

  it("should configure OpenAI backend correctly without Helicone", () => {
    const config = openAIConfig(
      withOpenAIBackend({ apiKey: openaiApiKey }, { heliconeEnabled: false }),
    );
    expect(config.baseURL).toBeUndefined();
    expect(config.apiKey).toBe(openaiApiKey);
  });
});
