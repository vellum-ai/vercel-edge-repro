import type { ClientOptions, OpenAI } from "openai";
import { environment } from "~/env/server";
type Model =
  OpenAI.Chat.ChatCompletionCreateParams.ChatCompletionCreateParamsStreaming["model"];

export const MODEL_NAME: Model =
  environment().NODE_ENV === "production" ? "gpt-4o" : "gpt-3.5-turbo";
/**
 * Modifies OpenAI configuration to enable Azure backend.
 *
 * @example
 * const config = openAIConfig(withAzureBackend({ domain: "your-azure-domain", apiKey: "your-azure-api-key" }))
 */
export function withAzureBackend(
  azureOpts: { domain: string; apiKey: string; model?: Model },
  opts: CustomClientOptions,
): CustomClientOptions {
  if (!azureOpts.model) {
    azureOpts.model = MODEL_NAME;
  }
  if (opts.heliconeEnabled) {
    opts.baseURL = `https://oai.hconeai.com/openai/deployments/${azureOpts.model}`;
    opts.defaultHeaders = {
      ...opts.defaultHeaders,
      "Helicone-OpenAI-API-Base": `https://${azureOpts.domain}.openai.azure.com`,
    };
  }

  return {
    ...opts,
    defaultHeaders: {
      ...opts.defaultHeaders,
      "api-key": azureOpts.apiKey,
    },
    defaultQuery: {
      "api-version": "2023-08-01-preview",
    },
  };
}

/**
 * Modifies OpenAI configuration to enable Azure backend.
 *
 * @example
 * const config = openAIConfig(withOpenAIBackend({ apiKey: "your-azure-api-key" }))
 */
export function withOpenAIBackend(
  openAIOpts: { apiKey: string },
  opts: CustomClientOptions,
): CustomClientOptions {
  if (opts.heliconeEnabled) {
    opts.baseURL = "https://oai.hconeai.com/v1";
  }

  return {
    ...opts,
    apiKey: openAIOpts.apiKey,
  };
}

/**
 * Modifies OpenAI configuration to enable Helicone proxy.
 *
 * @example
 * const openai = new OpenAI(withAzureBackend(withHelicone({ heliconeApiKey: "your-helicone-api-key", requestID: "your-request-id", userID: "your-user-id" })))
 */
export function withHelicone(hopts: {
  apiKey: string;
  requestID: string;
  userID: string;
}): CustomClientOptions {
  return {
    defaultHeaders: {
      "Helicone-Auth": `Bearer ${hopts.apiKey}`,
      "Helicone-User-Id": hopts.userID,
      "Helicone-Request-Id": hopts.requestID,
    },
    heliconeEnabled: true,
  };
}

export function openAIConfig(opts: CustomClientOptions): ClientOptions {
  const { heliconeEnabled, ...rest } = opts;
  return rest;
}

type CustomClientOptions = ClientOptions & {
  heliconeEnabled: boolean;
};
