import { Box, useTheme } from "@mui/joy";
import { Suspense, lazy } from "react";

const ClientLoader = lazy(() => import("./ThreeDots.tsx"));

export function MessageLoading() {
  const theme = useTheme();
  return (
    <Box display="flex" flexDirection="row">
      <Box
        padding="8px 12px"
        alignItems="flex-start"
        alignSelf="stretch"
        width="90%"
        sx={{
          borderRadius: "6px",
          boxShadow: "0px 1px 2px 0px rgba(21, 21, 21, 0.08)",
          backgroundColor: theme.palette["indigo-50"],
        }}
      >
        <Suspense>
          <ClientLoader />
        </Suspense>
      </Box>
    </Box>
  );
}
