/* Defines a collection of skeleton loader components to be used in HistoryTable
 * Placeholder content is designed to be representative of actual content to
 * reduce layout shift */
import { Skeleton, Typography } from "@mui/joy";

export function CreatedAtSkeleton() {
  return (
    <Typography>
      <Skeleton>12/12/12 at 12:12 am</Skeleton>
    </Typography>
  );
}

export function ToolNameSkeleton() {
  return (
    <Typography>
      <Skeleton>Tool Name</Skeleton>
    </Typography>
  );
}

export function OutputSkeleton() {
  return (
    <Typography>
      <Skeleton>
        Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit.
      </Skeleton>
    </Typography>
  );
}
