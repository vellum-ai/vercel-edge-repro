import { Box, Button, Typography, useTheme } from "@mui/joy";
import { useNavigate } from "@remix-run/react";
import { useContext } from "react";
import { toast } from "react-hot-toast";
import { captureEvent } from "~/utils/metrics";
import { createDefaultTool } from "../../utils/api/tools";
import { SessionContext } from "../Layout/ApplicationShell";

export function EmptyState({ tab }: { tab: string }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { session } = useContext(SessionContext);
  let title = "";
  let subtitle = "";
  switch (tab) {
    case "all":
      title = "You don't have any tools yet!";
      subtitle =
        "All of your custom and favorite tools will be saved here. To get started, duplicate a tool or create your own, or press the heart icon to save a favorite.";
      break;
    case "favorites":
      title = "You don’t have any favorites yet!";
      subtitle =
        "All of your favorite tools will be saved here. To add a favorite, press the heart icon on a tool.";
      break;
    default:
      title = "You don't have any tools yet!";
      subtitle =
        " All of your custom tools will be saved here. To get started, duplicate a tool or create your own.";
      break;
  }
  return (
    <Box
      width={"100%"}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      gap={"16px"}
      paddingTop={"24px"}
    >
      <Typography
        sx={{
          color: theme.palette["blueGrey-800"],
          fontFeatureSettings: "'clig' off, 'liga' off",
          fontFamily: "Nunito",
          fontSize: "20px",
          fontStyle: "normal",
          fontWeight: 700,
          lineHeight: "160%",
          letterSpacing: "0.15px",
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          color: theme.palette["blueGrey-800"],
          textAlign: "center",
          fontFeatureSettings: "'clig' off, 'liga' off",
          fontFamily: "Open Sans",
          fontSize: "16px",
          fontStyle: "normal",
          fontWeight: 400,
          lineHeight: "150%",
          letterSpacing: "0.15px",
        }}
      >
        {subtitle}
      </Typography>
      {tab === "my tools" ? (
        <Button
          sx={{
            background: theme.palette["blue-500"],
            padding: "4px, 10px, 4px, 10px",
            borderRadius: "4px",
            marginTop: "8px",
            boxShadow: "0px 3px 1px -2px #00000033",
            height: "30px",
            textTransform: "uppercase",
            width: { xs: "100%", sm: "max-content" },
          }}
          onClick={async () => {
            if (!session?.user) {
              toast.error("You must be logged in to do that");
              return;
            }
            captureEvent("click-create-new", {});
            const newTool = await createDefaultTool(session.user.id);
            navigate(`/tools/${newTool.id}?editMode=true`);
          }}
        >
          Create New Tool
        </Button>
      ) : null}
    </Box>
  );
}
