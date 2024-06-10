import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
  useTheme,
} from "@mui/joy";
import { useNavigate } from "@remix-run/react";
import toast from "react-hot-toast";
import type { ToolContextType } from "../../context/ToolContext";
import { deleteTool } from "../../utils/api/tools";
type ToolDeletionModalType = {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  tool: ToolContextType;
};
export function ToolDeletionModal(props: ToolDeletionModalType) {
  const theme = useTheme();
  const navigate = useNavigate();
  const handleDelete = async () => {
    const error = await deleteTool(props.tool.id);
    if (error) {
      toast.error("Failed to Delete.");
    }
    navigate("/my-tools");
  };

  return (
    <Modal
      open={props.modalOpen}
      onClose={() => {
        props.setModalOpen(false);
      }}
    >
      <ModalDialog
        variant="outlined"
        role="alertdialog"
        sx={{
          width: "30%",
          gap: 3,
        }}
      >
        <ModalClose />
        <DialogTitle>
          <Typography
            sx={{
              color: theme.palette["gray-800"],
              fontFamily: "Nunito",
              fontSize: 24,
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "133.4%",
            }}
          >
            Are you sure?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              color: theme.palette["gray-800"],
              fontFamily: "Open Sans",
              fontSize: 16,
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "150%",
              letterSpacing: "0.15px",
            }}
          >
            Deleting this tool will permanently remove it from your tools. You
            cannot undo this action.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="solid"
            color="danger"
            onClick={() => {
              handleDelete();
            }}
          >
            YES, DELETE
          </Button>
          <Button
            variant="outlined"
            color="neutral"
            onClick={() => {
              props.setModalOpen(false);
            }}
          >
            NO, CANCEL
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
