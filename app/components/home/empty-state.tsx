import { Box } from "@mui/joy";

export const EmptyState = () => (
  <Box py={5} display={"flex"} flexDirection={"column"} gap={1}>
    <Box textAlign={"center"} fontSize={32} fontWeight={600}>
      No matching results
    </Box>
    <Box textAlign={"center"} fontSize={18} color={"gray.700"}>
      Please try using a different search or filter
    </Box>
  </Box>
);
