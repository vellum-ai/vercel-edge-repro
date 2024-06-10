import { Box } from "@mui/joy";
import type { PropsWithChildren } from "react";

/*
 * A toolbar component that lays out its children in a row on large screens and
 * in a column on small screens.
 *
 * @param props
 */
export const ToolBar: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box
      component="nav"
      sx={(theme) => ({
        display: "flex",
        flexDirection: "row",
        [theme.breakpoints.down("md")]: {
          flexDirection: "column",
          gap: theme.spacing(2),
        },
        justifyContent: "space-between",
      })}
    >
      {children}
    </Box>
  );
};
ToolBar.displayName = "ToolBar";
