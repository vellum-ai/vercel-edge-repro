import { Chip, Radio } from "@mui/joy";

type FilterChipProps = React.PropsWithChildren<{
  active?: boolean;
  topic: string;
}>;

export const FilterChip: React.FC<FilterChipProps> = ({
  active = false,
  topic,
}) => {
  return (
    <Chip
      variant="plain"
      slotProps={{
        label: {
          id: `topic-label-${topic}`,
        },
      }}
      sx={(theme) => ({
        padding: theme.spacing(1),
        fontSize: "14px",
        backgroundColor: "transparent",
        color: active ? theme.palette.common.white : theme.palette["gray-800"],
      })}
    >
      <Radio
        slotProps={{
          action: {
            sx: (theme) => ({
              borderWidth: active ? 0 : 1,
              backgroundColor: active
                ? theme.palette["blue-550"]
                : "transparent",
              "&:hover": {
                backgroundColor: active
                  ? theme.palette["blue-550"]
                  : theme.palette["gray-100"],
              },
            }),
          },
          input: {
            id: `topic-${topic}`,
          },
          label: {
            htmlFor: `topic-${topic}`,
            sx: (theme) => ({
              color: active
                ? theme.palette.common.white
                : theme.palette["gray-800"],
            }),
          },
        }}
        overlay
        variant="outlined"
        value={topic}
        label={topic}
        disableIcon
      />
    </Chip>
  );
};
FilterChip.displayName = "FilterChip";
