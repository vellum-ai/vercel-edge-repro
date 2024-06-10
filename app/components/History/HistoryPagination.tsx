import { ArrowDropDown, ChevronLeft, ChevronRight } from "@mui/icons-material";
import {
  Box,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  Typography,
} from "@mui/joy";

type HistoryPaginationProps = {
  pageSize: number;
  pageIndex: number;
  pageCount: number;
  totalRowCount: number;
  pageSizeOptions: readonly number[];
  onClickNextPage: () => void;
  onClickPrevPage: () => void;
  onChangePageSize: (pageSize: number) => void;
};

export function HistoryPagination({
  pageSize,
  pageIndex,
  totalRowCount,
  onChangePageSize,
  onClickPrevPage,
  pageCount,
  onClickNextPage,
  pageSizeOptions,
}: HistoryPaginationProps) {
  const resultsRangeStart = pageIndex * pageSize + 1;
  const resultsRangeEnd = Math.min(
    pageIndex * pageSize + pageSize,
    totalRowCount,
  );
  const resultsRange = `${resultsRangeStart} - ${resultsRangeEnd}`;
  return (
    <Box display="flex" width="100%" justifyContent={"flex-end"}>
      <Box
        sx={{
          justifySelf: "flex-end",
          paddingX: 2,
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          fontSize: "13px",
        }}
      >
        <Dropdown>
          <Typography
            variant="plain"
            fontWeight="300"
            fontFamily="Open Sans"
            fontSize="13px"
          >
            Rows per page:
          </Typography>
          <MenuButton
            variant="plain"
            size="sm"
            endDecorator={<ArrowDropDown />}
            sx={{
              padding: "4px",
              fontWeight: "300",
              fontFamily: "Open Sans",
            }}
          >
            {pageSize}
          </MenuButton>
          <Menu>
            {Array.from(pageSizeOptions).map((size) => (
              <MenuItem key={size} onClick={() => onChangePageSize(size)}>
                {size}
              </MenuItem>
            ))}
          </Menu>
        </Dropdown>

        <Typography
          variant="plain"
          fontWeight="300"
          fontFamily="Open Sans"
          fontSize="13px"
          padding={2}
        >
          {resultsRange} of {totalRowCount}
        </Typography>
        <Box>
          <IconButton onClick={onClickPrevPage} disabled={pageIndex === 0}>
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={onClickNextPage}
            disabled={pageIndex === pageCount - 1}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
