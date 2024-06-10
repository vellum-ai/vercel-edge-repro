import { Forum } from "@mui/icons-material";
import { Box } from "@mui/joy";
import { ClientOnly } from "~/components/client-only";
import { hashCode } from "../utils";
import Blue from "./assets/blue.png";
import Fuchsia from "./assets/fuchsia.png";
import Green from "./assets/green.png";
import Purple from "./assets/purple.png";
import Teal from "./assets/teal.png";

const cardIcons = [
  { icon: "green", color: "#4FBD18", asset: Green },
  { icon: "teal", color: "#18BD9F", asset: Teal },
  { icon: "blue", color: "#124AB6", asset: Blue },
  { icon: "purple", color: "#6A18BD", asset: Purple },
  { icon: "fuchsia", color: "#BD18BD", asset: Fuchsia },
] as const;

export const ToolIcon = ({ title }: { title: string }) => {
  const titleHashCode = hashCode(title);
  const iconColorIdx = titleHashCode % cardIcons.length;
  const iconColor = cardIcons[iconColorIdx]?.color;
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
    >
      <img
        src={cardIcons[iconColorIdx]?.asset}
        height="49px"
        alt="card icon blob"
      />
      <ClientOnly>
        <Forum
          sx={{
            width: "35px",
            height: "35px",
            color: iconColor,
            position: "absolute",
          }}
        />
      </ClientOnly>
    </Box>
  );
};
ToolIcon.displayName = "ToolIcon";
