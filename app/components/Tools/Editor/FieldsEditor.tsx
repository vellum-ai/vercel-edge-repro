import {
  AddOutlined,
  ArrowDropDown,
  Edit,
  ErrorOutline,
  InfoOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Tooltip,
  useTheme,
} from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { type Dispatch, useState } from "react";
import { useSession } from "../../../hooks/useSession.ts";
import { useTool } from "../../../hooks/useTool.ts";
import type { ToolField } from "../../../utils/api/apiTypes/tools.ts";
import { getTeams } from "../../../utils/api/teams.ts";
import { ToolFormSectionHeader } from "../presentational/ToolFormSectionHeader.tsx";
import { FieldInputs } from "./FieldInputs.tsx";
import {
  type CustomizedIntegration,
  PremappedFieldsModal,
} from "./PremappedFieldsModal.tsx";

type FieldsEditorProps = {
  setFields: (fields: ToolField[]) => void;
  fields: ToolField[];
  emptyFields: number[];
  integrationID: string | undefined;
  setIntegrationID: Dispatch<React.SetStateAction<string | undefined>>;
};
export const FieldsEditor = ({
  fields,
  setFields,
  emptyFields,
  integrationID,
  setIntegrationID,
}: FieldsEditorProps) => {
  const theme = useTheme();
  const tool = useTool();
  const updateFieldLabel = (targetFieldID: number, newLabel: string) =>
    setFields(
      fields.map((f) =>
        f.id === targetFieldID ? { ...f, label: newLabel } : f,
      ),
    );
  const deleteField = (targetFieldID: number) =>
    setFields(fields.filter((f) => f.id !== targetFieldID));

  const getUniqueID = () => {
    if (fields.length === 0) return 0;
    return Math.max(...fields.map((f) => f.id)) + 1;
  };
  const newField = (type: ToolField["field_type"]): ToolField => ({
    id: getUniqueID(), // Just needs to be unique among the rendered field, will be replaced with a proper ID when inserted to DB.
    order_index: -1, // Currently unused
    label: "",
    tool_id: tool.id,
    field_type: type,
    integration_key: null,
  });
  // if there is already a file upload field, disable the option to add another one:
  const addFileUploadFieldDisabled = fields.some(
    (f) => f.field_type === "file_upload",
  );

  const onAddPreMappedFields = (c: CustomizedIntegration) => {
    setFields([
      ...fields,
      ...c.externalFields.map((p, i) => {
        return {
          id: getUniqueID() + i,
          order_index: -1,
          label: p.label,
          tool_id: tool.id,
          field_type: p.field_type,
          integration_key: p.integration_key,
        };
      }),
    ]);
  };

  const fileUploadOption = () => {
    const field = (
      <MenuItem
        onClick={() => setFields([...fields, newField("file_upload")])}
        disabled={addFileUploadFieldDisabled}
      >
        <span>File Upload</span>
        {addFileUploadFieldDisabled && (
          <ErrorOutline
            sx={{
              ml: 1,
              fontSize: "1rem",
            }}
          />
        )}
      </MenuItem>
    );
    if (addFileUploadFieldDisabled)
      return (
        <Tooltip title="Only one file upload field allowed; there is already a file upload field.">
          <div>{field}</div>
        </Tooltip>
      );
    return field;
  };
  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      gap="20px"
      sx={{
        border: "1px solid",
        borderRadius: theme.radius.sm,
        borderColor: theme.palette["gray-200"],
      }}
      padding={3}
    >
      <div>
        <Box display="flex" gap="4px" sx={{ alignItems: "center" }}>
          <ToolFormSectionHeader label="Additional Details for AI" />
          <Tooltip
            title="Additional details are the information that the user will put in whenever they use your tool. The AI will apply these inputs to the generated output."
            sx={{ maxWidth: "320px" }}
          >
            <InfoOutlined
              sx={{
                color: theme.palette["gray-500"],
                width: "16px",
                height: "16px",
              }}
            />
          </Tooltip>
        </Box>
      </div>

      {fields.map((field) => {
        return (
          <FieldInputs
            key={`field-${field.id}`}
            field={field}
            emptyField={emptyFields.includes(field.id)}
            updateFieldLabel={updateFieldLabel}
            deleteField={deleteField}
          />
        );
      })}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: "20px",
          justifyContent: "flex-end",
        }}
      >
        <EditPremappedFieldsButton
          onSave={onAddPreMappedFields}
          integrationID={integrationID}
          setIntegrationID={setIntegrationID}
        />
        <Dropdown>
          <MenuButton
            startDecorator={<AddOutlined />}
            endDecorator={<ArrowDropDown />}
            variant="outlined"
            sx={{
              textTransform: "uppercase",
              color: theme.palette["blue-600"],
              borderColor: theme.palette["blue-400"],
              fontWeight: 700,
              alignSelf: "center",
            }}
          >
            Add Details Field
          </MenuButton>
          <Menu>
            <MenuItem
              onClick={() => setFields([...fields, newField("long_text")])}
            >
              Long Text
            </MenuItem>
            <MenuItem
              onClick={() => setFields([...fields, newField("short_text")])}
            >
              Short Text
            </MenuItem>
            {fileUploadOption()}
          </Menu>
        </Dropdown>
      </Box>
    </Box>
  );
};

function EditPremappedFieldsButton({
  onSave,
  integrationID,
  setIntegrationID,
}: {
  onSave: (c: CustomizedIntegration) => void;
  integrationID: string | undefined;
  setIntegrationID: Dispatch<React.SetStateAction<string | undefined>>;
}) {
  const { session } = useSession();
  const theme = useTheme();
  const { data: teams } = useQuery({
    queryKey: ["teams", session?.user.id] as const,
    queryFn: getTeams,
  });
  const [open, setOpen] = useState(false);
  const onClick = () => {
    setOpen(true);
  };
  const onClickSave = (c: CustomizedIntegration) => {
    onSave(c);
    setOpen(false);
  };
  const onClickClose = () => {
    setIntegrationID(undefined);
    setOpen(false);
  };
  if (!teams || teams.length === 0) return null;
  return (
    <>
      <Button
        onClick={onClick}
        variant="outlined"
        startDecorator={<Edit />}
        sx={{
          textTransform: "uppercase",
          color: theme.palette["blue-600"],
          borderColor: theme.palette["blue-400"],
          fontWeight: 700,
          alignSelf: "center",
          alignItems: "center",
        }}
      >
        Edit Pre-Mapped Fields
      </Button>
      <PremappedFieldsModal
        modalOpen={open}
        onSave={onClickSave}
        onCancel={onClickClose}
        teamIDs={teams.map((team) => team.id)}
        integrationID={integrationID}
        setIntegrationID={setIntegrationID}
      />
    </>
  );
}
