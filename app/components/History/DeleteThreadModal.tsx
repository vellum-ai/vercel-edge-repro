import { DeleteOutline } from "@mui/icons-material";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Modal,
  ModalDialog,
} from "@mui/joy";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "../../hooks/useSession";
import { deleteThreadByID } from "../../utils/api/threads";

export function DeleteThreadModal({ threadID }: { threadID: number }) {
  const [open, setOpen] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { session } = useSession();
  const deleteThreadMutation = useMutation({
    mutationFn: deleteThreadByID,
    onSuccess: () => {
      toast.success("Output deleted");
      queryClient.invalidateQueries({
        queryKey: ["history-entries", session?.user?.id],
      });
      setOpen(false);
    },
  });

  const onClickCancel = () => {
    setOpen(false);
  };

  const onClickDelete = () => {
    deleteThreadMutation.mutate(threadID);
  };
  return (
    <>
      <IconButton
        onClick={() => {
          setOpen(true);
        }}
      >
        <DeleteOutline />
      </IconButton>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog variant="outlined" role="alertdialog" maxWidth={"400px"}>
          <DialogTitle sx={{ fontSize: "24px" }}>Are you sure?</DialogTitle>
          <Divider />
          <DialogContent
            sx={{
              color: "gray-800",
            }}
          >
            Deleting this output will permanently remove the generated output
            from your history. You cannot undo this action.
          </DialogContent>
          <DialogActions>
            <Button
              variant="solid"
              color="danger"
              sx={{
                textTransform: "uppercase",
              }}
              onClick={onClickDelete}
            >
              Yes, Delete
            </Button>
            <Button
              sx={{
                textTransform: "uppercase",
              }}
              variant="outlined"
              color="neutral"
              onClick={onClickCancel}
            >
              No, Cancel
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </>
  );
}
