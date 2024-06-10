import { Typography } from "@mui/joy";

interface ToolFormLabelProps {
  label: string;
}

export function ToolFormLabel({ label }: ToolFormLabelProps) {
  return (
    <Typography
      sx={{
        fontFamily: "Open Sans",
        lineHeight: "20px",
        color: "#020813",
        fontSize: "16px",
        fontWeight: 600,
      }}
    >
      {label}
    </Typography>
  );
}
