export const config = { runtime: "edge" };
import qs from "qs";

export const action = async () => {
  return new Response(qs.stringify({ a: 1, b: 2 }), { status: 200 });
}
