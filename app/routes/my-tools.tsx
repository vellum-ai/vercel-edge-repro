import { Box, TabList, TabPanel, Tabs, tabClasses } from "@mui/joy";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@vercel/remix";
import { z } from "zod";
import Main from "~/components/Layout/Main";
import { ToolCard } from "~/components/home/tool-card";
import { ToolGrid } from "~/components/home/tool-grid";
import { EmptyState } from "~/components/my-tools/empty-state";
import { Tab } from "~/components/my-tools/tab";
import { LikedToolsProvider } from "~/context/liked-tools-context";
import { createClient } from "~/lib/supabase.server";

const ToolSummarySchema = z
  .object({
    id: z.number(),
    user_id: z.string(),
    title: z.string(),
    description: z.string().nullable().default(""),
    tool_status: z.string(),
    updated_at: z.coerce.date().default(() => new Date()),
    favorite_tools: z.array(z.object({ tool_id: z.number() })).default([]),
  })
  .transform((t) => ({
    id: t.id,
    user_id: t.user_id,
    title: t.title,
    description: t.description ?? "",
    isOfficial: t.tool_status === "official",
    isFavorite: t.favorite_tools.length > 0,
    updatedAt: t.updated_at,
    isMine: false,
  }));

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const client = createClient(request);
  const { data: user } = await client.auth.getUser();
  if (!user.user) {
    return [];
  }

  const created = await client
    .from("tools")
    .select("*, favorite_tools(tool_id)")
    .eq("user_id", user.user.id)
    .order("updated_at", { ascending: false })
    .then((tools) => tools.data ?? [])
    .then((tools) => tools.map((t) => ToolSummarySchema.parse(t)))
    .then((tools) => tools.map((t) => ({ ...t, isMine: true })));

  const favorites = await client
    .from("favorite_tools")
    .select("tool_id, tool:tools(*)")
    .then((tools) => tools.data ?? [])
    .then((tools) => tools.map((t) => t.tool))
    .then((tools) => tools.map((t) => ToolSummarySchema.parse(t)))
    .then((tools) => tools.map((t) => ({ ...t, isFavorite: true })))
    .then((tools) => tools.filter((t) => t.user_id !== user.user.id));

  return [...created, ...favorites];
};

export default function MyTools() {
  const tools = useLoaderData<typeof loader>();
  const allToolList = tools;
  const myTools = tools.filter((tool) => tool.isMine);
  const favTools = tools.filter((tool) => tool.isFavorite);

  return (
    <LikedToolsProvider initial={favTools.map((t) => t.id)}>
      <Main>
        <Box display={"flex"} flexDirection="column" width={"100%"}>
          <Tabs
            aria-label="Basic tabs"
            defaultValue={0}
            sx={(theme) => ({ backgroundColor: theme.palette["indigo-25"] })}
          >
            <TabList
              sx={(theme) => ({
                [`&& .${tabClasses.root}`]: {
                  flex: "initial",
                  bgcolor: "transparent",
                  "&:hover": {
                    bgcolor: "transparent",
                  },
                  [`&.${tabClasses.selected}`]: {
                    color: theme.palette["blue-600"],
                    "&::after": {
                      height: 2,
                      borderTopLeftRadius: 3,
                      borderTopRightRadius: 3,
                      bgcolor: theme.palette["blue-600"],
                    },
                  },
                },
              })}
            >
              <Tab>All</Tab>
              <Tab> MY TOOLS </Tab>
              <Tab> FAVORITES </Tab>
            </TabList>
            <TabPanel
              value={0}
              sx={{ paddingLeft: "0", paddingRight: "0" }}
              slotProps={{
                root: {
                  id: "tab-panel-all",
                },
              }}
            >
              {allToolList.length === 0 ? (
                <EmptyState tab="all" />
              ) : (
                <ToolGrid>
                  {allToolList.map((tool) => (
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
                </ToolGrid>
              )}
            </TabPanel>
            <TabPanel
              value={1}
              sx={{ paddingLeft: "0", paddingRight: "0" }}
              slotProps={{
                root: {
                  id: "tab-panel-mine",
                },
              }}
            >
              {myTools.length === 0 ? (
                <EmptyState tab="mine" />
              ) : (
                <ToolGrid>
                  {myTools.map((tool) => (
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
                </ToolGrid>
              )}
            </TabPanel>
            <TabPanel
              value={2}
              sx={{ paddingLeft: "0", paddingRight: "0" }}
              slotProps={{
                root: {
                  id: "tab-panel-favorites",
                },
              }}
            >
              {favTools.length === 0 ? (
                <EmptyState tab="favorites" />
              ) : (
                <ToolGrid>
                  {favTools.map((tool) => (
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
                </ToolGrid>
              )}
            </TabPanel>
          </Tabs>
        </Box>
      </Main>
    </LikedToolsProvider>
  );
}
