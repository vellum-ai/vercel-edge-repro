import { Box, Button, Link, Typography } from "@mui/joy";
import { useNavigate } from "@remix-run/react";
import toast from "react-hot-toast";
import { useSession } from "../../hooks/useSession";
import { createDefaultTool } from "../../utils/api/tools";

export function HistoryEmptyState() {
  const { session } = useSession();
  const navigate = useNavigate();
  return (
    <Box
      alignItems={"center"}
      display={"flex"}
      flexDirection={"column"}
      gap={2}
      maxWidth={(theme) => theme.breakpoints.values.sm}
      justifyContent={"center"}
      margin={"auto"}
      padding={"40px"}
    >
      <Typography textAlign="center" fontWeight={"bold"} fontSize="xl">
        You don’t have any output history yet!
      </Typography>
      <Typography textAlign={"center"}>
        All of your generated output from using tools will be saved here. To get
        started, use a content generator or custom AI chatbot.
      </Typography>
      <Box display="flex" flexDirection={"column"} gap={1}>
        <Button
          component={Link}
          href="/"
          variant="solid"
          size="sm"
          color="primary"
          sx={{
            textTransform: "uppercase",
            "&:hover": {
              color: "white",
            },
          }}
        >
          Browse tools
        </Button>
        <Link
          textColor={"blue-600"}
          fontFamily={"Open Sans"}
          fontWeight={"600"}
          onClick={async () => {
            if (!session?.user) {
              toast.error("You must be logged in to do that");
              return;
            }

            const newTool = await createDefaultTool(session.user.id);
            navigate(`/tools/${newTool.id}?editMode=true`);
          }}
        >
          Or, create your own tool
        </Link>
      </Box>
    </Box>
  );
}
