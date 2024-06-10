import { Delete, WarningAmberOutlined } from "@mui/icons-material";
import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
} from "@mui/joy";
import theme from "~/theme";
import type { ToolField } from "../../../utils/api/apiTypes/tools";
import { FileUploadField } from "../../FileUpload/FileUploadField";

type FieldInputsProps = {
  field: ToolField;
  emptyField: boolean;
  updateFieldLabel: (targetFieldID: number, newLabel: string) => void;
  deleteField: (targetFieldID: number) => void;
};

export function FieldInputs({
  field,
  emptyField,
  updateFieldLabel,
  deleteField,
}: FieldInputsProps) {
  let placeholder = "";
  switch (field.field_type) {
    case "long_text":
      placeholder = "Long Text Label";
      break;
    case "short_text":
      placeholder = "Short Text Label";
      break;
    case "file_upload":
      placeholder = "File Upload Label";
      break;
    default:
      break;
  }

  const fieldDisplay = () => {
    if (field.field_type === "file_upload") {
      return (
        <Box sx={{ mr: "45px" }}>
          <FileUploadField file={null} setFile={() => {}} disabled />
        </Box>
      );
    }

    return (
      <Input
        disabled
        placeholder={
          field.field_type === "long_text"
            ? "Long answer text "
            : "Short answer text "
        }
        sx={{
          "--Input-placeholderColor": theme.palette["gray-700"],
          background: "lightgray",
          marginRight: "45px",
        }}
      />
    );
  };
  return (
    <Box sx={{ width: "100%" }}>
      <FormControl error={emptyField}>
        <FormLabel sx={{ mb: 1, width: "100%", display: "flex" }}>
          <Input
            sx={{
              flex: 1,
              color: "black",
              "--Input-placeholderOpacity": 0.45,
            }}
            placeholder={placeholder}
            value={field.label ?? ""}
            onChange={(e) => updateFieldLabel(field.id, e.target.value)}
          />
          <IconButton
            variant="soft"
            sx={{ ml: 1 }}
            onClick={() => deleteField(field.id)}
          >
            <Delete />
          </IconButton>
        </FormLabel>
        {fieldDisplay()}
        {emptyField ? (
          <FormHelperText>
            <WarningAmberOutlined />
            Please enter a value for the detail field label.
          </FormHelperText>
        ) : null}
      </FormControl>
    </Box>
  );
}
