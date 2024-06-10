import {
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
  useTheme,
} from "@mui/joy";
import { lazy } from "react";
const CustomMarkdown = lazy(() => import("../App/CustomMarkdown"));
export function AIPromptModal({
  open,
  setOpen,
  prompt,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  prompt: string;
}) {
  const theme = useTheme();
  return (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
    >
      <ModalDialog
        sx={{
          padding: theme.spacing(3),
          backgroundColor: "white",
        }}
      >
        <ModalClose />
        <DialogTitle sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography
            sx={{
              color: theme.palette["gray-900"],
              fontFamily: "Nunito",
              fontSize: 24,
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "32px",
            }}
          >
            AI Prompt
          </Typography>
          <Typography
            sx={{
              color: theme.palette["gray-600"],
              fontFamily: "Open Sans",
              fontSize: 14,
              fontStyle: "normal",
              fontWeight: 300,
              lineHeight: "20px",
              letterSpacing: "0.17px",
            }}
          >
            These are the instructions that the AI uses to generate your custom
            output.
          </Typography>
        </DialogTitle>
        <DialogContent
          sx={{
            gap: theme.spacing(2),
            width: "560px",
            maxWidth: "100%",
          }}
        >
          <Typography
            sx={{
              color: theme.palette["gray-800"],
              fontFamily: "Open Sans",
              fontSize: 16,
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "24px",
              letterSpacing: "0.15px",
            }}
          >
            <CustomMarkdown content={prompt} />
          </Typography>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
}
