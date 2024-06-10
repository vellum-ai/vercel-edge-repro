import { Close, InfoOutlined, Search } from "@mui/icons-material";
import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Tooltip,
} from "@mui/joy";
import IconButton from "@mui/joy/IconButton";
import type { ChangeEventHandler } from "react";

type HistoryPaginationProps = {
  onChangeSearch: ChangeEventHandler<HTMLInputElement>;
  onChangeStartDate: (value: string) => void;
  onChangeEndDate: (value: string) => void;
  startDateError: boolean;
  endDateError: boolean;
  search: string;
  startDate: string;
  endDate: string;
  setSearch: () => void;
};
export function HistoryFilters({
  onChangeSearch,
  onChangeStartDate,
  onChangeEndDate,
  startDateError,
  endDateError,
  startDate,
  endDate,
  search,
  setSearch,
}: HistoryPaginationProps) {
  return (
    <Box
      display={"flex"}
      gap={1}
      sx={(theme) => ({
        flexDirection: "row",
        justifyContent: "space-between",
        [theme.breakpoints.down("md")]: {
          flexDirection: "column",
          justifyContent: "start",
        },
      })}
      width={"100%"}
      alignItems={"center"}
    >
      <FormControl
        sx={(theme) => ({
          [theme.breakpoints.down("md")]: {
            width: "100%",
          },
        })}
      >
        <FormLabel>Search Tools</FormLabel>
        <Input
          onChange={onChangeSearch}
          size="md"
          value={search}
          startDecorator={<Search />}
          placeholder="Search for tool"
          sx={(theme) => ({
            fontFamily: "Open Sans",
            backgroundColor: theme.palette.common.white,
            borderColor: theme.palette["gray-200"],
            borderRadius: 100,
            width: "250px",
          })}
          endDecorator={
            search ? (
              <Tooltip title="Clear Search">
                <IconButton
                  onClick={() => {
                    setSearch();
                  }}
                  sx={{ borderRadius: "50%" }}
                >
                  <Close />
                </IconButton>
              </Tooltip>
            ) : null
          }
        />
      </FormControl>
      <Box
        display={"flex"}
        flexDirection={"row"}
        justifyContent="start"
        width="100%"
        gap={3}
        sx={(theme) => ({
          [theme.breakpoints.up("md")]: {
            justifyContent: "end",
            width: "auto",
          },
        })}
      >
        <FormControl error={startDateError}>
          <FormLabel>Start Date</FormLabel>
          <Input
            sx={(theme) => ({
              backgroundColor: theme.palette.common.white,
              maxWidth: "144px",
            })}
            type="date"
            onChange={(e) => onChangeStartDate(e.target.value)}
            value={startDate}
            slotProps={{
              input: {
                max: endDate,
              },
            }}
          />
          {startDateError && (
            <FormHelperText>
              <InfoOutlined />
              The start date must be before the end date
            </FormHelperText>
          )}
        </FormControl>

        <FormControl error={endDateError}>
          <FormLabel>End Date</FormLabel>
          <Input
            sx={(theme) => ({
              backgroundColor: theme.palette.common.white,
              maxWidth: "144px",
            })}
            type="date"
            onChange={(e) => onChangeEndDate(e.target.value)}
            value={endDate}
            slotProps={{
              input: {
                min: startDate,
              },
            }}
          />
          {endDateError && (
            <FormHelperText>
              <InfoOutlined />
              The start date must be before the end date
            </FormHelperText>
          )}
        </FormControl>
      </Box>
    </Box>
  );
}
