import { useContext } from "react";
import { ToolContext, type ToolContextType } from "../context/ToolContext";

export const useTool = (): ToolContextType => {
  const context = useContext(ToolContext);

  if (context === undefined) {
    throw new Error("useTool must be used within a ToolProvider");
  }

  return context;
};
