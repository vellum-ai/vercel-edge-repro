import {
  CalendarTodayOutlined,
  DeleteOutline,
  Edit,
  FileCopyOutlined,
  Link,
  PersonOutline,
  PrivacyTipOutlined,
  RestartAlt,
  Share,
  SmartToyOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/joy";
import type { SxProps as JoySxProps } from "@mui/joy/styles/types/theme";
import { useNavigate } from "@remix-run/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useSession } from "../../hooks/useSession.ts";
import { useTool } from "../../hooks/useTool.ts";
import type { IntegrationField } from "../../utils/api/apiTypes/tools.ts";
import { duplicateTool, toggleFavoriteTools } from "../../utils/api/tools.ts";
import { captureEvent } from "../../utils/metrics.ts";
import { AIPromptModal } from "./AIPromptModal.tsx";
import { ContentToolActions as ToolActions } from "./ContentToolActions.tsx";
import { ToolDeletionModal } from "./ToolDeletionModal";
import { ToolPreUploadedFiles } from "./ToolPreUploadedFiles.tsx";
import { ToolFormBox } from "./presentational/ToolFormBox.tsx";
import { ToolFormLabel } from "./presentational/ToolFormLabel.tsx";

type ToolDisplayProps = {
  setFile: (file: File | null) => void;
  onClickEdit: () => void;
  isEditing: boolean;
  onClickGenerate: (fieldResponses: Record<string, string>) => void;
  onClickCancel: () => void;
  onClickRestart: () => void;
  isStreaming: boolean;
  threadID?: string;
  integrationFields: IntegrationField[];
  integrationID: string | null;
};

export const ToolDisplay = ({
  onClickEdit,
  onClickGenerate,
  onClickCancel,
  onClickRestart,
  isStreaming,
  setFile,
  threadID,
  integrationFields,
  integrationID,
}: ToolDisplayProps) => {
  const tool = useTool();
  const { session, isAuthenticated } = useSession();
  const isToolAuthor = session?.user.id === tool.authorID;
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [showAIPrompt, setShowAIPrompt] = useState<boolean>(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const onClickShare = () => {
    const url = `${window.location.origin}/tools/${tool.id}/threads/${threadID}`;
    captureEvent("click-share", { toolID: tool.id });
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("Conversation link copied to clipboard");
        if (threadID) {
          captureEvent("thread-shared", { threadID, toolID: tool.id });
        }
      })
      .catch((e) => {
        toast.error(`Failed to copy conversation link${JSON.stringify(e)}`);
      });
  };

  const onClickCopyToolLink = () => {
    const url = `${window.location.origin}/tools/${tool.id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("Copied tool link to clipboard");
      })
      .catch((e) => {
        toast.error(`Failed to copy tool link ${JSON.stringify(e)}`);
      });
  };

  const handleSavedTool = async () => {
    if (!session?.user) {
      toast.error("You must be logged in to do that");
      return;
    }
    const toolFavorited = tool.isFavorited;
    if (!toolFavorited) {
      await toggleFavoriteTools(tool.id, session.user.id, !toolFavorited);
      captureEvent("tool-updated", { toolID: tool.id });
      toast.success("Added to Favorites");
    } else {
      await toggleFavoriteTools(tool.id, session.user.id, !toolFavorited);
      toast.success("Removed from Favorites");
    }
    return;
  };

  const mutationOnFavorite = useMutation({
    mutationFn: async () => {
      return await handleSavedTool();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tool", tool.id] });
    },
    onError: (e) => {
      console.error(e);
      toast.error("Something went wrong");
    },
  });
  const handleDuplicate = async () => {
    if (!session?.user) return;
    captureEvent("click-duplicate", { toolID: tool.id });
    const newTool = await duplicateTool(tool, session.user.id);
    navigate(`/tools/${newTool.id}`);
    await queryClient.invalidateQueries({ queryKey: ["tool"] });
  };

  const onClickViewAIPrompt = () => {
    setShowAIPrompt(true);
  };

  const FavoriteButton = () => {
    const theme = useTheme();
    return (
      <>
        {tool.isFavorited ? (
          <Tooltip title="Unfavorite" placement="top">
            <IconButton
              onClick={() => {
                mutationOnFavorite.mutate();
              }}
            >
              <FavoriteIcon
                sx={{
                  color: theme.palette["blue-500"],
                  cursor: "pointer",
                }}
              />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Favorite" placement="top">
            <IconButton
              onClick={() => {
                mutationOnFavorite.mutate();
              }}
            >
              <FavoriteBorderIcon
                sx={{
                  cursor: "pointer",
                }}
              />
            </IconButton>
          </Tooltip>
        )}
      </>
    );
  };
  return (
    <ToolFormBox>
      {/* Share, Duplicate, Edit */}
      <Box
        width="100%"
        gap="20px"
        justifyContent="space-between"
        alignItems="flex-start"
        display="inline-flex"
      >
        <Typography
          sx={{ fontSize: "28px", fontFamily: "Nunito", fontWeight: 600 }}
        >
          {" "}
          {tool.title}
        </Typography>
        <Box
          justifyContent="flex-end"
          alignItems="center"
          gap="8px"
          display="flex"
        >
          <FavoriteButton />

          <RestartButton onClick={onClickRestart} />
          <Dropdown open={open} onOpenChange={() => setOpen(!open)}>
            <Tooltip title="More actions" placement="top">
              <MenuButton
                sx={{
                  border: "unset",
                  width: "24px",
                  height: "24px",
                }}
              >
                <MoreVertIcon />
              </MenuButton>
            </Tooltip>
            <Menu>
              {isToolAuthor && (
                <MenuItem onClick={onClickEdit}>
                  <EditButton />
                </MenuItem>
              )}
              <MenuItem onClick={onClickCopyToolLink}>
                <CopyLinkButton />
              </MenuItem>
              {threadID && (
                <MenuItem onClick={onClickShare}>
                  <ShareButton />
                </MenuItem>
              )}
              {isAuthenticated && (
                <MenuItem onClick={handleDuplicate}>
                  <DuplicateButton />
                </MenuItem>
              )}
              <MenuItem onClick={onClickViewAIPrompt}>
                <ViewAIPromptButton />
              </MenuItem>

              {session?.user && isToolAuthor ? (
                <MenuItem
                  onClick={() => {
                    setModalOpen(true);
                  }}
                >
                  <DeleteOutline sx={{ fill: theme.palette["blue-500"] }} />
                  <Typography> Delete </Typography>
                </MenuItem>
              ) : null}
            </Menu>
          </Dropdown>
          <AIPromptModal
            open={showAIPrompt}
            setOpen={setShowAIPrompt}
            prompt={tool.systemPrompt}
          />
          <ToolDeletionModal
            setModalOpen={setModalOpen}
            modalOpen={modalOpen}
            tool={tool}
          />
        </Box>
      </Box>

      {/* Author, UpdatedAt, Verification */}
      <ToolIcons />
      {/* Tool Properties */}
      <Box
        width="100%"
        height="100%"
        display="flex"
        flexDirection="column"
        gap={3}
      >
        {tool.description && (
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Box
              width="100%"
              paddingX="12px"
              paddingY="8px"
              fontFamily="Open Sans"
              fontSize="16px"
              fontWeight={400}
              bgcolor="#D1F2EC"
              borderRadius="6px"
              whiteSpace="pre-line"
            >
              <WithLinks content={tool.description} />
            </Box>
          </Box>
        )}
        {tool.documents.length > 0 && (
          <Box display="flex" flexDirection="column" gap={0.5}>
            <ToolFormLabel label="Files for the AI" />
            <ToolPreUploadedFiles />
          </Box>
        )}
        <ToolActions
          integrationID={integrationID}
          integrationFields={integrationFields}
          setFile={setFile}
          isStreaming={isStreaming}
          onClickGenerate={onClickGenerate}
          onClickCancel={onClickCancel}
        />
      </Box>
    </ToolFormBox>
  );
};

/* ToolIcons displays the "Author", "Last Edited", and "Verified" icons */
function ToolIcons() {
  const tool = useTool();
  const theme = useTheme();
  const boxStyle: JoySxProps = {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
  };
  const textStyle: JoySxProps = {
    fontSize: "16px",
    fontWeight: 300,
    fontFamily: "Open Sans",
    color: theme.palette["gray-600"],
  };
  const iconStyle = {
    fill: theme.palette["gray-500"],
    stroke: theme.palette["gray-500"],
    width: "16px",
    height: "16px",
    strokeWidth: 0,
  };
  return (
    <Box
      display="flex"
      width="100%"
      fontFamily="Open Sans"
      fontWeight={300}
      alignItems={{
        xs: "flex-start",
        sm: "center",
      }}
      gap={2}
      flexDirection="row"
    >
      <Box sx={boxStyle}>
        <PersonOutline sx={iconStyle} />
        <Typography sx={textStyle}>
          {tool.isOfficial ? " TeachingLab" : " User"}
        </Typography>
      </Box>
      <Box sx={boxStyle}>
        <CalendarTodayOutlined sx={iconStyle} />
        <Typography sx={textStyle}>
          {`Last Edited ${formatDate(tool.updatedAt)}`}
        </Typography>
      </Box>
      {tool.isVerified || tool.isOfficial ? (
        <Box sx={boxStyle}>
          <VerifiedUserOutlined sx={iconStyle} />
          <Typography sx={textStyle}>Verified</Typography>
        </Box>
      ) : (
        <Box sx={boxStyle}>
          <PrivacyTipOutlined sx={iconStyle} />
          <Typography sx={textStyle}>Unverified</Typography>
        </Box>
      )}
    </Box>
  );
}

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const RestartButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Tooltip title="Restart" placement="top">
      <IconButton onClick={onClick}>
        <RestartAlt />
      </IconButton>
    </Tooltip>
  );
};
const DuplicateButton = () => {
  const theme = useTheme();
  return (
    <>
      <FileCopyOutlined sx={{ fill: theme.palette["blue-500"] }} />
      <Typography> Duplicate </Typography>
    </>
  );
};
const EditButton = () => {
  const theme = useTheme();
  return (
    <>
      <Edit sx={{ fill: theme.palette["blue-500"] }} />{" "}
      <Typography> Edit </Typography>
    </>
  );
};

const ViewAIPromptButton = () => {
  const theme = useTheme();
  return (
    <>
      <SmartToyOutlined sx={{ fill: theme.palette["blue-500"] }} />{" "}
      <Typography> View AI Prompt </Typography>
    </>
  );
};

const ShareButton = () => {
  const theme = useTheme();
  return (
    <>
      <Share sx={{ fill: theme.palette["blue-500"] }} />{" "}
      <Typography> Share Chat </Typography>
    </>
  );
};

const CopyLinkButton = () => {
  const theme = useTheme();
  return (
    <>
      <Link sx={{ fill: theme.palette["blue-500"] }} />{" "}
      <Typography> Copy Link </Typography>
    </>
  );
};

/* parse the content, and if there's any text that begins with http, turn it into an anchor tag: */
const WithLinks = ({ content }: { content: string }) =>
  content.split(" ").map((word: string) =>
    word.startsWith("http") ? (
      <Box sx={{ lineBreak: "anywhere" }}>
        <a key={word} href={word} target="_blank" rel="noopener noreferrer">
          {word}{" "}
        </a>
      </Box>
    ) : (
      `${word} `
    ),
  );
