import { Typography } from "@mui/joy";
import type { PropsWithChildren } from "react";

export function EllipsisText({ children }: PropsWithChildren) {
  return (
    <Typography
      height="1.2rem"
      sx={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        minWidth: "0",
      }}
    >
      {children}
    </Typography>
  );
}
