import { useNavigate } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import { ToolProvider } from "../../context/ToolContext";
import { fetchCompleteTool } from "../../utils/api/tools";
import Main from "../Layout/Main";
import ToolLoad from "./ToolLoad";
import { UnifiedTool } from "./UnifiedTool";

type ToolViewProps = {
  toolID: number;
};
export function UnifiedToolView({ toolID }: ToolViewProps) {
  const navigate = useNavigate();
  const { data: tool, status: toolStatus } = useQuery({
    queryKey: ["tool", toolID] as const,
    queryFn: async ({ queryKey: [, id] }) => {
      if (!id) {
        throw new Error(`Invalid tool ID: ${id}`);
      }
      const newTool = await fetchCompleteTool(id);
      return newTool;
    },
  });
  switch (toolStatus) {
    case "error":
      navigate("/");
      return `Failed to fetch tool ${toolID}`;
    case "pending":
      return (
        <Main justifyContent={"center"}>
          <ToolLoad />
        </Main>
      );
    case "success":
      return (
        <Main
          justifyContent={"center"}
          overflow="hidden"
          sx={{
            paddingBottom: "0px",
            paddingTop: (theme) => theme.spacing(5),
          }}
        >
          <ToolProvider value={tool}>
            <UnifiedTool />
          </ToolProvider>
        </Main>
      );
    default:
      return <div>Something went wrong.</div>;
  }
}
