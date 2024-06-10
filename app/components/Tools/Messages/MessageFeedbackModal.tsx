import { Done } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  Modal,
  ModalClose,
  ModalDialog,
  Textarea,
  Typography,
  useTheme,
} from "@mui/joy";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { UpdateMessageFeedback } from "../../../utils/api/tools";
// import { deleteTool } from '../../utils/api/tools';
type MessageFeedbackModalType = {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  rating: boolean | undefined;
  messageFeedbackId: number;
};
export function MessageFeedbackModal(props: MessageFeedbackModalType) {
  const theme = useTheme();
  const [feedback, setFeedback] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const negativeFeedbackCategories = [
    "Inaccurate",
    "Offensive/Unsafe",
    "Incomplete",
    "Irrelevant",
  ];
  const positiveFeedbackCategories = [
    "Correct",
    "Easy to understand",
    "Complete",
    "Relevant",
  ];

  const handleFeedback = async () => {
    if (props.rating !== undefined) {
      try {
        const completeFeedback =
          selectedCategory.length !== 0
            ? `${selectedCategory.toString()}: ${feedback}`
            : feedback;
        await UpdateMessageFeedback(completeFeedback, props.messageFeedbackId);
      } catch (error) {
        toast.error("Something went wrong");
        return;
      }
      setSelectedCategory([]);
      props.setModalOpen(false);
      toast.success("Feedback submitted");
    }
  };
  const selectCategory = (
    c: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedCategory((cats) =>
      !event.target.checked
        ? selectedCategory.filter((cat) => cat !== c)
        : [...cats, c],
    );
  };
  const feedbackCategories = (rating: boolean | undefined) => {
    const categories = rating
      ? positiveFeedbackCategories
      : negativeFeedbackCategories;

    return (
      <List
        orientation="horizontal"
        wrap
        sx={{
          "--List-gap": "8px",
          "--ListItem-radius": "20px",
          "--ListItem-minHeight": "32px",
          "--ListItem-gap": "4px",
          marginBottom: "16px",
          marginTop: "1px",
          paddingLeft: "1px",
        }}
      >
        {categories.map((c: string) => {
          const checked = selectedCategory.includes(c);
          return (
            <ListItem key={c}>
              {selectedCategory.includes(c) && (
                <Done
                  sx={{
                    ml: -0.5,
                    zIndex: 2,
                    pointerEvents: "none",
                    color: theme.palette["gray-500"],
                  }}
                />
              )}
              <Checkbox
                variant={checked ? "soft" : "outlined"}
                disableIcon
                label={c}
                overlay
                checked={checked}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  selectCategory(c, event);
                }}
                sx={{
                  fontFamily: "Open Sans",
                  fontSize: 14,
                  fontStyle: "normal",
                  fontWeight: 300,
                  lineHeight: "20px",
                  color: theme.palette["gray-800"],
                }}
                slotProps={{
                  action: ({ checked }) => ({
                    sx: checked
                      ? {
                          bgcolor: theme.palette["blue-50"],
                          border: "1px solid",
                          borderColor: theme.palette["blue-200"],
                          "&:hover": {
                            bgcolor: theme.palette["blue-100"],
                            borderColor: theme.palette["blue-300"],
                          },
                        }
                      : {
                          "&:hover": {
                            bgcolor: theme.palette["blue-100"],
                            borderColor: theme.palette["blue-300"],
                          },
                        },
                  }),
                }}
              />
            </ListItem>
          );
        })}
      </List>
    );
  };

  return (
    <Modal
      open={props.modalOpen}
      onClose={() => {
        props.setModalOpen(false);
        setSelectedCategory([]);
      }}
    >
      <ModalDialog
        variant="outlined"
        role="alertdialog"
        sx={{
          width: "560px",
          gap: 3,
          paddingX: "24px",
        }}
      >
        <ModalClose />
        <DialogTitle>
          <Box display={"flex"} alignItems={"center"}>
            <Typography
              sx={{
                color: theme.palette["gray-800"],
                fontFamily: "Nunito",
                fontSize: 24,
                fontStyle: "normal",
                fontWeight: 600,
                lineHeight: "32px",
              }}
            >
              Optional: Why did you choose that rating?
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <>
            {feedbackCategories(props.rating)}

            <Textarea
              minRows={4}
              placeholder={"Provide additional feedback"}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </>
        </DialogContent>
        <DialogActions>
          <Button
            variant="solid"
            sx={{
              background: theme.palette["blue-500"],
              alignSelf: "end",
              "&:hover": {
                background: theme.palette["blue-600"],
              },
              "&:active": {
                background: theme.palette["blue-700"],
              },
            }}
            onClick={() => {
              handleFeedback();
            }}
          >
            SUBMIT FEEDBACK
          </Button>
          <Button
            variant="outlined"
            color="neutral"
            onClick={() => {
              props.setModalOpen(false);
              setSelectedCategory([]);
            }}
          >
            SKIP
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
