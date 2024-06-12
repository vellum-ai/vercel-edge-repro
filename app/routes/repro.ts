export const config = { runtime: "edge" };
import { VellumClient } from "vellum-ai";
new VellumClient({ apiKey: "" });
export const action = async () => {
  return new Response('Hello World', { status: 200 });
}
