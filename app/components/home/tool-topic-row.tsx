import { Box, Typography } from "@mui/joy";
import { ToolGrid } from "./tool-grid";

type ToolTopicRowProps = React.PropsWithChildren<{
  title: string;
}>;

export const ToolTopicRow: React.FC<ToolTopicRowProps> = ({
  children,
  title,
}) => {
  return (
    <Box display="flex" flexDirection="column" component="section" gap={2}>
      <Typography
        component="h2"
        sx={(theme) => ({
          fontSize: "24px",
          fontWeight: 600,
          color: theme.palette["gray-700"],
          lineHeight: "32px",
        })}
      >
        {title}
      </Typography>
      <ToolGrid>{children}</ToolGrid>
    </Box>
  );
};
