import { Typography } from "@mui/joy";

interface ToolFormLabelProps {
  label: string;
}

export function ToolFormSectionHeader({ label }: ToolFormLabelProps) {
  return (
    <Typography
      sx={{
        color: "#2A3031",
        fontSize: "20px",
        fontFamily: "Nunito",
        fontWeight: "400",
        lineHeight: "32px",
        letterSpacing: 0.15,
        wordWrap: "break-word",
      }}
    >
      {label}
    </Typography>
  );
}
