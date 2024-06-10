import { Box, Link, Stack, Typography } from "@mui/joy";

type HistoryPaginationProps = {
  onClickClearFilters: () => void;
};
export function HistoryNoResults({
  onClickClearFilters,
}: HistoryPaginationProps) {
  return (
    <Box
      borderRadius="md"
      width="100%"
      padding={3}
      bgcolor={"white"}
      display="flex"
      justifyContent={"center"}
    >
      <Stack textAlign={"center"}>
        <Typography variant="plain" fontWeight="bold" fontSize="xl">
          No results found
        </Typography>

        <Typography variant="plain" fontSize="md">
          Sorry, we couldn’t find a match. Please adjust your search terms or
          filters and try again.
        </Typography>
        <Typography>
          <Link fontWeight="bold" onClick={onClickClearFilters}>
            Clear filters
          </Link>
        </Typography>
      </Stack>
    </Box>
  );
}
