import OpenAI from "openai";
import { environment } from "~/env/server";
import {
  openAIConfig,
  withAzureBackend,
  withHelicone,
  withOpenAIBackend,
} from "./builder";

const OPENAI_API_KEY = environment().OPENAI_API_KEY;
const AZURE_API_KEY = environment().AZURE_API_KEY;
const HELICONE_API_KEY = environment().HELICONE_API_KEY;
const AZURE_DOMAIN = environment().AZURE_DOMAIN;

export const getOpenAIInstance = (userID: string, requestID: string) => {
  return new OpenAI(
    openAIConfig(
      withOpenAIBackend(
        { apiKey: OPENAI_API_KEY },
        withHelicone({ apiKey: HELICONE_API_KEY, userID, requestID }),
      ),
    ),
  );
};

export const getAzureInstance = (userID: string, requestID: string) => {
  return new OpenAI(
    openAIConfig(
      withAzureBackend(
        { apiKey: AZURE_API_KEY, domain: AZURE_DOMAIN },
        withHelicone({ apiKey: HELICONE_API_KEY, userID, requestID }),
      ),
    ),
  );
};
