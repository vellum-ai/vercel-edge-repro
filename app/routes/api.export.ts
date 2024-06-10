import { type ActionFunction, type TypedResponse, json } from "@vercel/remix";
import { z } from "zod";
import { environment } from "~/env/server";
import { newExportService } from "~/export/service";
import { createClient } from "~/lib/supabase.server";

export type ExportResponse = {
  url: string;
};

const ExportRequestSchema = z.object({
  content: z.string(),
});
export const action: ActionFunction = async ({
  request,
}): Promise<TypedResponse<ExportResponse>> => {
  const supabaseClient = createClient(request);
  const exportService = newExportService({
    CLIENT_EMAIL: environment().GOOGLE_CLIENT_EMAIL,
    PRIVATE_KEY: environment().GOOGLE_PRIVATE_KEY,
  });

  const requestBody = await request.json();
  const parseResult = ExportRequestSchema.safeParse(requestBody);
  if (!parseResult.success) {
    throw new Response("Invalid request", { status: 400 });
  }

  const { data, error: exportError } = await exportService.exportDocument({
    title: "TeachingLab AI Export",
    content: parseResult.data.content,
  });

  if (exportError) {
    throw new Response(exportError.message, { status: 500 });
  }

  return json({
    url: data.url,
  });
};
