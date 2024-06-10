import { Box } from "@mui/joy";
import type { PropsWithChildren } from "react";

export const ToolGrid: React.FC<PropsWithChildren> = ({ children }) => (
  <Box
    sx={(theme) => ({
      display: "grid",
      [theme.breakpoints.up("sm")]: {
        gridTemplateColumns: "repeat(2, 1fr)",
      },
      [theme.breakpoints.up("md")]: {
        gridTemplateColumns: "repeat(3, 1fr)",
      },
      [theme.breakpoints.up("xl")]: {
        gridTemplateColumns: "repeat(4, 1fr)",
      },
      gap: theme.spacing(3),
    })}
  >
    {children}
  </Box>
);
