import OpenAI, { toFile } from "https://deno.land/x/openai@v4.16.1/mod.ts";
import { FormFile } from "multiparser";

export async function handleFileUploads(
	userFile: FormFile | FormFile[],
	openai: OpenAI,
) {
	let openAIFile = null;
	if (userFile && !Array.isArray(userFile) && userFile.size > 0) {
		openAIFile = await openai.files.create({
			file: await toFile(userFile.content, userFile.filename),
			purpose: "assistants",
		});
	}
	return openAIFile;
}
