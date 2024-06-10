import { FavoriteBorder } from "@mui/icons-material";
import { IconButton } from "@mui/joy";
import type { EventHandler } from "react";
import { ClientOnly } from "../client-only";

type LikeButtonProps = {
  onClick: EventHandler<React.MouseEvent | React.KeyboardEvent>;
};

export const LikeButton = ({ onClick }: LikeButtonProps) => {
  return (
    <IconButton
      onClick={onClick}
      aria-label="Add to favorites"
      sx={{ minHeight: 0, minWidth: 0 }}
    >
      <ClientOnly>
        <FavoriteBorder sx={{ color: "gray" }} />
      </ClientOnly>
    </IconButton>
  );
};
LikeButton.displayName = "LikeButton";
