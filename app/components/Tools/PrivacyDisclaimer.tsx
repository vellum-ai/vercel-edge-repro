import { Box, Typography, useTheme } from "@mui/joy";
export function PrivacyDisclaimer() {
  const theme = useTheme();
  return (
    <Box sx={{ textAlign: "center", paddingBottom: 3 }}>
      <Typography
        sx={{
          fontWeight: "400",
          color: theme.palette["gray-500"],
          fontSize: 13,
          fontFamily: "Open Sans",
        }}
      >
        To protect students’ privacy, we strongly recommend that you don’t share
        any information or documents that contain PII on TeachingLab.ai.
      </Typography>
      <br />
      <Typography
        sx={{
          fontWeight: "400",
          color: theme.palette["gray-500"],
          fontSize: 13,
          fontFamily: "Open Sans",
        }}
      >
        Please review TeachingLab.ai’s generated materials and check everything
        for accuracy. On occasion, AI can generate biased or inaccurate
        information.
      </Typography>
    </Box>
  );
}
