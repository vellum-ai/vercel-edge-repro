/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
// openAIInterface.ts

import { OpenAI } from "https://deno.land/x/openai@v4.20.0/mod.ts";
import { ChatCompletionChunk } from "https://deno.land/x/openai@v4.20.0/resources/mod.ts";
import { Stream } from "https://deno.land/x/openai@v4.20.0/streaming.ts";
const apiKey = Deno.env.get("OPENAI_API_KEY");
const heliconeApiKey = Deno.env.get("HELICONE_API_KEY");
const azureApiKey = Deno.env.get("AZURE_OPENAI_API_KEY");
const azureDomain = Deno.env.get("AZURE_DOMAIN");

function isStream(value: any): value is Stream<ChatCompletionChunk> {
	return (
		value &&
		typeof value.controller === "object" &&
		typeof value.iterator === "function"
	);
}

function isChatCompletion(value: any): value is OpenAI.ChatCompletion {
	return value && typeof value.id === "string" && Array.isArray(value.choices);
}

const request_id = String(crypto.randomUUID());

export class OpenAIInterface {
	private primaryOpenAI: OpenAI;
	private azureOpenAI: OpenAI;
	public requestID = request_id;

	constructor(userId: string) {
		this.primaryOpenAI = new OpenAI({
			apiKey: apiKey,
			baseURL: "https://oai.hconeai.com/v1",
			defaultHeaders: {
				"Helicone-Auth": `Bearer ${heliconeApiKey}`,
				"Helicone-User-Id": userId,
				"Helicone-Request-Id": request_id,
			},
		});

		this.azureOpenAI = new OpenAI({
			baseURL: "https://oai.hconeai.com/openai/deployments/gpt-4o",
			defaultHeaders: {
				"Helicone-Auth": `Bearer ${heliconeApiKey}`,
				"Helicone-OpenAI-API-Base": `https://${azureDomain}.openai.azure.com`,
				"Helicone-User-Id": userId,
				"Helicone-Request-Id": request_id,
				"api-key": azureApiKey,
			},
			defaultQuery: {
				"api-version": "2023-08-01-preview",
			},
		});
	}

	async generate(params: OpenAI.ChatCompletionCreateParams, stream: boolean) {
		try {
			// First attempt with the primary OpenAI instance
			return await this.primaryOpenAI.chat.completions.create({
				...params,
				stream,
			});
		} catch (error) {
			if (error instanceof OpenAI.APIError) {
				// if it is simply an error where we went past token limit, then we should
				// just throw that error WITHOUT retrying with the Azure OpenAI instance:
				if (error.code === "context_length_exceeded") {
					throw error;
				}
			}
			console.error("Primary OpenAI instance failed:", error);

			// Retry with the Azure OpenAI instance
			try {
				const completionResult = await this.azureOpenAI.chat.completions.create(
					{
						...params,
						stream,
					},
				);
				const completionResultList = [
					completionResult,
					{ "Helicone-Request-Id": request_id },
				];
				return completionResultList;
			} catch (azureError) {
				console.error("Azure OpenAI instance also failed:", azureError);
				throw new Error("Both OpenAI instances failed");
			}
		}
	}

	async generateChatStreamCompletions(
		params: OpenAI.ChatCompletionCreateParams,
	): Promise<Stream<ChatCompletionChunk>> {
		const result = await this.generate(params, true);
		if (isStream(result)) {
			return result;
		} else {
			throw new Error(
				"Expected a Stream<ChatCompletionChunk>, but got a ChatCompletion",
			);
		}
	}

	async generateChatCompletions(
		params: OpenAI.ChatCompletionCreateParams,
	): Promise<OpenAI.ChatCompletion> {
		const result = await this.generate(params, false);
		if (isChatCompletion(result)) {
			return result;
		} else {
			throw new Error(
				"Expected a ChatCompletion, but got a Stream<ChatCompletionChunk>",
			);
		}
	}
}
