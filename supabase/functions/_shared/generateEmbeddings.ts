import { OpenAI } from "https://deno.land/x/openai@v4.16.1/mod.ts";
import { Embedding } from "https://deno.land/x/openai@v4.16.1/resources/mod.ts";

const apiKey = Deno.env.get("OPENAI_API_KEY");

const openAI = new OpenAI({
	apiKey: apiKey || "",
});

export async function generateEmbeddings(text: string) {
	try {
		const res = await openAI.embeddings.create({
			input: text,
			model: "text-embedding-ada-002",
		});

		const embeddings = res.data.map((d: Embedding) => d.embedding);
		if (embeddings.length === 1) return embeddings[0];
		return [];
	} catch (e) {
		console.error(
			`Error while generating embeddings for this text ${text}: ${e}`,
		);
		return [];
	}
}
