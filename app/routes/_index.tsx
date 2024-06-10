import { Box, RadioGroup, Typography } from "@mui/joy";
import {
  Form,
  type ShouldRevalidateFunction,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import type { LoaderFunctionArgs } from "@vercel/remix";
import { createContext, useEffect, useMemo, useRef } from "react";
import { z } from "zod";
import Main from "~/components/Layout/Main";
import { EmptyState } from "~/components/home/empty-state";
import { FilterChip } from "~/components/home/filter-chip";
import { ToolCard } from "~/components/home/tool-card";
import { ToolTopicRow } from "~/components/home/tool-topic-row";
import { ToolBar } from "~/components/home/toolbar";
import { Search } from "~/components/ui/search";
import { LikedToolsProvider } from "~/context/liked-tools-context";
import { useStable } from "~/hooks/use-stable";
import { createClient } from "~/lib/supabase.server";
import { ToolSummarySchema } from "~/tool/model";
import { groupBy } from "~/utils/group-by";

const DEFAULT_FILTER = "All tools";
const RECENT_FILTER = "Recent Tools";
const DEFAULT_QUERY = "";

const ParamsSchema = z.object({
  filter: z.string().default(DEFAULT_FILTER),
  query: z.string().default(DEFAULT_QUERY),
});

/**
 * @see https://remix.run/docs/en/main/route/should-revalidate
 *
 * We can skip revalidation if the filter or query has changed
 * because we handle filtering and searching on the client.
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  nextUrl,
  currentUrl,
}) => {
  const currentSearch = new URLSearchParams(currentUrl.search);
  const nextSearch = new URLSearchParams(nextUrl.search);
  const wasFilterChanged =
    nextSearch.get("filter") !== currentSearch.get("filter");
  const wasQueryChanged =
    nextSearch.get("query") !== currentSearch.get("query");
  if (wasFilterChanged || wasQueryChanged) {
    return false;
  }
  return true;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const params = url.searchParams;
  const { filter, query } = ParamsSchema.parse(Object.fromEntries(params));
  const client = createClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  const topics = await client
    .from("topics")
    .select("name")
    .then((topics) => topics.data ?? [])
    .then((topics) => topics.map((t) => t.name))
    .then((topics) => [
      DEFAULT_FILTER,
      ...(user ? [RECENT_FILTER] : []),
      ...topics,
    ]);

  const recentToolIDs = await client
    .from("recent_tools") // Sorted in descending order by default by the time of the last usage
    .select("id")
    .then((ids) => ids.data ?? [])
    .then((ids) => ids.map((id) => id.id));

  const recentTools = await client
    .from("tools")
    .select("*, favorite_tools(tool_id)")
    .in("id", recentToolIDs)
    .then((tools) => tools.data ?? [])
    .then((tools) =>
      tools.map((t) => ({ ...t, topics: [{ name: RECENT_FILTER }] })),
    ) // Manually put each recent tool into fake "Recent Tools" topic
    .then((tools) => tools.map((t) => ToolSummarySchema.parse(t)))
    .then((tools) =>
      tools.sort(
        (a, b) => recentToolIDs.indexOf(a.id) - recentToolIDs.indexOf(b.id),
      ),
    ); // Restore the original order

  const officialTools = await client
    .from("tools")
    .select("*, topics!inner(name), favorite_tools(tool_id)")
    .eq("tool_status", "official")
    .then((tools) => tools.data ?? [])
    .then((tools) => tools.map((t) => ToolSummarySchema.parse(t)));

  const tools = [...recentTools, ...officialTools];

  return {
    filter,
    query,
    topics,
    tools,
  };
};

export const LikedToolsContext = createContext<Set<number>>(new Set());
export default function Home() {
  const loaderData = useLoaderData<typeof loader>();
  const [params, setSearchParams] = useSearchParams();
  const filter = params.get("filter") ?? DEFAULT_FILTER;
  const query = params.get("query") ?? DEFAULT_QUERY;
  const initialFilterValue = useStable(() => filter);
  const initialSearchValue = useStable(() => query);
  const groupedFilteredToolers = useMemo(
    () =>
      groupBy(
        loaderData.tools.filter(
          (t) =>
            (filter === DEFAULT_FILTER || t.topic?.includes(filter)) &&
            t.title.toLowerCase().includes(query.toLowerCase()),
        ),
        (t) => t.topic ?? "Uncategorized",
      ),
    [query, loaderData.tools, filter],
  );
  const form = useRef<HTMLFormElement>(null);
  return (
    <LikedToolsProvider
      initial={loaderData.tools.filter((t) => t.isFavorite).map((t) => t.id)}
    >
      <Main>
        <Box display="flex" flexDirection="column" width="100%">
          <Form ref={form}>
            <ToolBar>
              <RadioGroup
                aria-label="Filter tools by topic"
                defaultValue={initialFilterValue}
                name="filter"
                onChange={(e) => {
                  e.preventDefault();
                  setSearchParams(
                    { filter: e.currentTarget.value, query },
                    { replace: true },
                  );
                }}
                sx={() => ({
                  display: "flex",
                  flexWrap: "wrap",
                  flexDirection: "row",
                  gap: "12px",
                })}
              >
                {loaderData.topics.map((t) => (
                  <FilterChip key={t} active={t === filter} topic={t} />
                ))}
              </RadioGroup>
              <Search
                ariaLabel="Filter tools by name"
                onChange={(query) => {
                  setSearchParams({ query, filter }, { replace: true });
                }}
                defaultValue={initialSearchValue}
              />
            </ToolBar>
          </Form>
          {query ? (
            <Typography
              sx={(theme) => ({
                paddingTop: theme.spacing(3),
                color: theme.palette["gray-600"],
                fontStyle: "italic",
              })}
            >
              Search results for: "{query}"
            </Typography>
          ) : null}
          <Box display="flex" flexDirection="column" gap={4} paddingTop={3}>
            {Object.keys(groupedFilteredToolers).length === 0 && <EmptyState />}
            {Object.entries(groupedFilteredToolers).map(([topic, tools]) => (
              <ToolTopicRow key={topic} title={topic}>
                {tools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    id={tool.id}
                    title={tool.title}
                    description={tool.description}
                    lastModified={new Date()}
                    isOfficial={tool.isOfficial}
                    isFavorite={tool.isFavorite}
                  />
                ))}
              </ToolTopicRow>
            ))}
          </Box>
        </Box>
      </Main>
    </LikedToolsProvider>
  );
}
