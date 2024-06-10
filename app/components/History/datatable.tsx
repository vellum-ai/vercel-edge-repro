import { createColumnHelper } from "@tanstack/react-table";
import { DeleteThreadModal } from "./DeleteThreadModal";
import { EllipsisText } from "./EllipsisText";
import {
  CreatedAtSkeleton,
  OutputSkeleton,
  ToolNameSkeleton,
} from "./HistoryTableSkeletons";

/* Defines a single row in the datatable, including hidden metadata */
export type HistoryEntry = {
  id: number;
  toolName: string;
  toolID: number;
  lastOutput: string;
  createdAt: Date;
  pending: boolean;
};
const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});
const createPendingHistoryEntry = (): HistoryEntry => ({
  id: 0,
  toolID: 0,
  toolName: "",
  lastOutput: "",
  createdAt: new Date(),
  pending: true,
});

export const defaultHistoryEntries: HistoryEntry[] = Array.from(
  { length: 12 },
  createPendingHistoryEntry,
);

const columnHelper = createColumnHelper<HistoryEntry>();
export const columns = [
  columnHelper.accessor("toolName", {
    cell: (info) =>
      info.row.original.pending ? (
        <ToolNameSkeleton />
      ) : (
        <EllipsisText>{info.getValue()}</EllipsisText>
      ),
    header: () => "Tool",
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor("lastOutput", {
    cell: (info) =>
      info.row.original.pending ? (
        <OutputSkeleton />
      ) : (
        <EllipsisText>{info.getValue()}</EllipsisText>
      ),
    header: () => "Output",
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor("createdAt", {
    cell: (info) =>
      info.row.original.pending ? (
        <CreatedAtSkeleton />
      ) : (
        <EllipsisText>
          {dateTimeFormatter.format(info.getValue()).toLowerCase()}
        </EllipsisText>
      ),
    header: () => "Created",
    sortingFn: "datetime",
    enableSorting: true,
    filterFn: "inNumberRange",
    footer: (props) => props.column.id,
  }),
  columnHelper.display({
    id: "actions",
    header: () => "Delete",
    enableSorting: false,
    cell: (info) =>
      info.row.original.pending ? null : (
        <DeleteThreadModal threadID={info.row.original.id} />
      ),
  }),
];
