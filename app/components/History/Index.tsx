import { KeyboardArrowDown, UnfoldMore } from "@mui/icons-material";
import { Button, Sheet, Table, Typography } from "@mui/joy";
import { useNavigate } from "@remix-run/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import moment from "moment";
import { useEffect, useState } from "react";
import { useSession } from "../../hooks/useSession";
import { listThreadsForHistory } from "../../utils/api/threads";
import Main from "../Layout/Main";
import { HistoryEmptyState } from "./HistoryEmptyState";
import { HistoryFilters } from "./HistoryFilters";
import { HistoryNoResults } from "./HistoryNoResults";
import { HistoryPagination } from "./HistoryPagination";
import { type HistoryEntry, columns, defaultHistoryEntries } from "./datatable";
import { fuzzyFilter } from "./fuzzysearch";

// Default start day is one month ago
const DEFAULT_START_DATE = moment()
  .subtract(1, "month")
  .startOf("day")
  .format("YYYY-MM-DD");
const DEFAULT_END_DATE = moment()
  .add(1, "month")
  .startOf("day")
  .format("YYYY-MM-DD");
const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;
function Index() {
  const { session } = useSession();
  const [startDate, setStartDate] = useState<string>(DEFAULT_START_DATE);
  const [startDateError, setStartDateError] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<string>(DEFAULT_END_DATE);
  const [endDateError, setEndDateError] = useState<boolean>(false);
  const [sortingState, setSortingState] = useState<SortingState>([
    {
      id: "createdAt",
      desc: true,
    },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageSize: PAGE_SIZE_OPTIONS[0],
    pageIndex: 0,
  });

  const [tableData, setTableData] = useState<HistoryEntry[]>(
    defaultHistoryEntries,
  );
  const threadsQuery = useQuery({
    placeholderData: keepPreviousData,
    queryKey: ["history-entries", session?.user.id] as const,
    queryFn: ({ queryKey: [, userID] }) => {
      if (!userID) throw new Error("User ID not found");
      return listThreadsForHistory(userID);
    },
    enabled: !!session?.user.id && session.user.role !== "anon",
  });

  useEffect(() => {
    if (threadsQuery.status !== "success") return;
    setTableData(() =>
      threadsQuery.data.map((entry) => ({
        id: entry.id,
        toolID: entry.tool?.id || 0,
        toolName: entry.tool?.title || "",
        lastOutput: entry.lastMessage,
        createdAt: new Date(entry.created_at),
        pending: false,
      })),
    );
  }, [threadsQuery.status, threadsQuery.data]);

  const table = useReactTable({
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    data: tableData,
    columns,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting: sortingState,
      columnFilters,
      pagination: paginationState,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    onPaginationChange: setPaginationState,
    onSortingChange: setSortingState,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    enableSortingRemoval: false,
  });

  const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    table.setGlobalFilter(e.target.value);
  };
  const onClearSearch = () => {
    table.setGlobalFilter("");
  };

  const onChangeStartDate = (newDate: string) => {
    setStartDate(newDate);
    // convert to local time
    const newStartDate = new Date(newDate);
    const newStartTime = newStartDate.getTime();
    const createdAtColumn = table.getColumn("createdAt");
    if (!createdAtColumn) return;
    createdAtColumn.setFilterValue((currentFilterRange: [number, number]) => {
      if (!currentFilterRange)
        return [newStartTime, new Date(DEFAULT_END_DATE).getTime()];
      const [, currentEndTime] = currentFilterRange;
      setStartDateError(currentEndTime < newStartTime);
      return [newStartTime, currentEndTime];
    });
  };
  const onChangeEndDate = (newDate: string) => {
    setEndDate(newDate);
    const newEndDate = new Date(newDate);
    // Find the end UTC time at the end of selected day;
    const newEndTime = newEndDate.getTime() + 86399999;
    const createdAtColumn = table.getColumn("createdAt");
    if (!createdAtColumn) return;
    createdAtColumn.setFilterValue((currentFilterRange: [number, number]) => {
      if (!currentFilterRange)
        return [new Date(DEFAULT_START_DATE).getTime(), newEndTime];
      const [currentStartTime] = currentFilterRange;
      setEndDateError(currentStartTime > newEndTime);
      return [currentStartTime, newEndTime];
    });
  };

  const onClickClearFilters = () => {
    const createdAtColumn = table.getColumn("createdAt");
    if (!createdAtColumn) return;
    table.setGlobalFilter("");
    setStartDate(DEFAULT_START_DATE);
    setEndDate(DEFAULT_END_DATE);
    setStartDateError(false);
    setEndDateError(false);
    createdAtColumn.setFilterValue([
      new Date(DEFAULT_START_DATE).getTime(),
      new Date(DEFAULT_END_DATE).getTime(),
    ]);
  };

  const navigate = useNavigate();
  const onClickRow = (toolID: number, threadID: number) => {
    navigate(`/tools/${toolID}/threads/${threadID}`);
  };

  if (threadsQuery.status === "error") {
    return <div>Error: {threadsQuery.error.message}</div>;
  }

  if (!session || tableData.length === 0) {
    return <HistoryEmptyState />;
  }

  const noResultsFound = table.getRowModel().rows.length === 0;
  return (
    <Main>
      <HistoryFilters
        onChangeSearch={onChangeSearch}
        onChangeStartDate={onChangeStartDate}
        onChangeEndDate={onChangeEndDate}
        startDateError={startDateError}
        endDateError={endDateError}
        startDate={startDate}
        endDate={endDate}
        search={globalFilter}
        setSearch={onClearSearch}
      />
      <Sheet
        variant="soft"
        sx={{
          boxShadow: "sm",
          width: "100%",
          height: "fit-content",
          borderRadius: "md",
          backgroundColor: "white",
          overflowX: "auto",
        }}
      >
        <Table
          borderAxis="xBetween"
          sx={(theme) => ({
            height: "100%",
            width: "100%",
            minWidth: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
            "&, & thead, & tbody": { width: "100%" },
            "& th": {
              fontWeight: "bold",
            },
            "& th, & td": {
              padding: "16px",
            },
            "& th:nth-of-type(1), & td:nth-of-type(1)": {
              width: "20%",
              maxWidth: "10rem",
            },
            "& th:nth-of-type(2), & td:nth-of-type(2)": {
              width: "70%",
              maxWidth: "18rem",
              [theme.breakpoints.up("md")]: {
                maxWidth: "30rem",
              },
            },
            "& th:nth-of-type(3), & td:nth-of-type(3)": {
              width: "10%",
            },
            "& td:nth-of-type(4)": { width: "5%" },
            "& th:nth-of-type(4), & td:nth-of-type(4)": { width: "5%" },
            // Add hover effect to table rows
            "& tbody tr.content-row:hover": {
              backgroundColor: "gray-50",
            },
            // add cursor pointer to table rows
            "& tbody tr.content-row": {
              cursor: "pointer",
              fontFamily: "Open Sans",
            },
          })}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id} colSpan={header.colSpan}>
                      {table.getColumn(header.id)?.getCanSort() ? (
                        <Button
                          onClick={header.column.getToggleSortingHandler()}
                          variant="plain"
                          color="neutral"
                          endDecorator={
                            {
                              asc: <KeyboardArrowDown />,
                              desc: <KeyboardArrowDown />,
                              false: (
                                <UnfoldMore
                                  sx={{
                                    opacity: 0.8,
                                    "&:hover": {
                                      opacity: 1.0,
                                    },
                                  }}
                                />
                              ),
                            }[header.column.getIsSorted() as string] ?? null
                          }
                          sx={{
                            "& svg": {
                              transition: "0.2s",
                              transform:
                                header.column.getIsSorted() === "asc"
                                  ? "rotate(0deg)"
                                  : "rotate(180deg)",
                            },
                            "&:hover": { "& svg": { opacity: 1 } },
                            fontSize: "md",
                            padding: "0",
                            margin: "0",
                          }}
                        >
                          <Typography variant="plain">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </Typography>
                        </Button>
                      ) : null}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {noResultsFound && (
              <tr>
                <td colSpan={4}>
                  <HistoryNoResults onClickClearFilters={onClickClearFilters} />
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id} className="content-row">
                  {row.getVisibleCells().map((cell) => {
                    return cell.column.id === "actions" ? (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ) : (
                      <td
                        key={cell.id}
                        onClick={() =>
                          onClickRow(row.original.toolID, row.original.id)
                        }
                        onKeyDown={() => {
                          onClickRow(row.original.toolID, row.original.id);
                        }}
                        style={{}}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} style={{ backgroundColor: "white" }}>
                <HistoryPagination
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  pageSize={table.getState().pagination.pageSize}
                  pageIndex={table.getState().pagination.pageIndex}
                  pageCount={table.getPageCount()}
                  totalRowCount={table.getFilteredRowModel().rows.length}
                  onChangePageSize={table.setPageSize}
                  onClickPrevPage={table.previousPage}
                  onClickNextPage={table.nextPage}
                />
              </td>
            </tr>
          </tfoot>
        </Table>
      </Sheet>
    </Main>
  );
}

export default Index;
