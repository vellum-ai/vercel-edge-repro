import { Box, useTheme } from "@mui/joy";

export function ToolFormBox({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: "100%",
        padding: "24px",
        background: theme.palette.background.body,
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        gap: "20px",
        display: "inline-flex",
        boxShadow: "0px 3px 1px -2px rgba(0, 0, 0, 0.12)",
        borderRadius: "8px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: theme.palette["indigo-50"],

        height: "min-content",
      }}
    >
      {children}
    </Box>
  );
}
