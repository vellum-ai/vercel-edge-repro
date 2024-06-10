import { Close, Search as SearchIcon } from "@mui/icons-material";
import { IconButton, Input, Tooltip } from "@mui/joy";
import { useState } from "react";

type SearchProps = {
  ariaLabel?: string;
  defaultValue: string;
  onChange: (input: string) => void;
};

export const Search = ({ defaultValue, onChange, ariaLabel }: SearchProps) => {
  const [input, setInput] = useState(defaultValue);
  return (
    <Input
      slotProps={{
        input: { "aria-label": ariaLabel },
      }}
      name="query"
      value={input}
      size="md"
      onChange={(e) => {
        setInput(e.currentTarget.value);
        onChange(e.currentTarget.value);
      }}
      startDecorator={<SearchIcon />}
      placeholder="Search for tool"
      sx={(theme) => ({
        fontFamily: "Open Sans",
        backgroundColor: theme.palette.common.white,
        borderColor: theme.palette["gray-200"],
        borderRadius: 100,
        width: "250px",
      })}
      endDecorator={
        input !== "" ? (
          <Tooltip title="Clear Search">
            <IconButton
              onClick={() => {
                setInput("");
                onChange("");
              }}
              sx={{ borderRadius: "50%" }}
            >
              <Close />
            </IconButton>
          </Tooltip>
        ) : null
      }
    />
  );
};
Search.displayName = "Search";
