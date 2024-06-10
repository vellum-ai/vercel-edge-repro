import { AdsClick, AutoFixHigh, Stop } from "@mui/icons-material";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Textarea,
  Typography,
  useTheme,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { clientEnvironment } from "~/env/client";
import { useTool } from "../../hooks/useTool";
import { baseTextStyles } from "../../styles/baseTextStyles";
import type {
  IntegrationField,
  ToolField,
} from "../../utils/api/apiTypes/tools";
import { getIntegrationValues } from "../../utils/api/teams";
import { FileUploadField } from "../FileUpload/FileUploadField";
type FormValue =
  | { fieldID: number; value: string; fieldType: "long_text" | "short_text" }
  | { fieldID: number; value: File | null; fieldType: "file_upload" };

import { useChromeListener } from "~/utils/use-chrome-listener";

export const ContentToolActions = ({
  onClickGenerate,
  onClickCancel,
  isStreaming,
  setFile,
  integrationID,
  integrationFields: integrationParameters,
}: {
  onClickGenerate: (fieldResponses: Record<string, string>) => void;
  onClickCancel: () => void;
  isStreaming: boolean;
  setFile: (file: File | null) => void;
  integrationID: string | null;
  integrationFields: IntegrationField[];
}) => {
  const tool = useTool();
  const theme = useTheme();
  const [integrationValuesLoading, setIntegrationValuesLoading] =
    useState(false);
  const [integrationParameterValid, setIntegrationParameterValid] =
    useState(false);
  const [activeFieldID, setActiveFieldID] = useState<number | null>(null);
  const initialFormValues = tool.fields.map((field) => {
    switch (field.field_type) {
      case "long_text":
      case "short_text":
        return { fieldID: field.id, value: "", fieldType: field.field_type };
      case "file_upload":
        return { fieldID: field.id, value: null, fieldType: field.field_type };
      default:
        throw new Error(`Unsupported field type: ${field.field_type}`);
    }
  });
  const [formValues, setFormValues] = useState<FormValue[]>(initialFormValues);

  const getFieldValue = (field: ToolField) => {
    const fieldValue = formValues.find((fv) => fv.fieldID === field.id);
    if (!fieldValue) {
      throw new Error(`No value found for field ${field.id}`);
    }
    if (field.integration_key && integrationValuesLoading) {
      return "Loading...";
    }
    if (field.integration_key && !integrationParameterValid) {
      return "";
    }
    if (field.field_type === "file_upload") {
      return fieldValue.value as File | null;
    }
    return fieldValue.value as string;
  };

  const handleTextFieldChange = (fieldID: number, newValue: string) => {
    setFormValues((currentValues) =>
      currentValues.map((v) =>
        v.fieldID === fieldID && v.fieldType !== "file_upload"
          ? { ...v, value: newValue }
          : v,
      ),
    );
  };

  const handleFileFieldChange = (fieldID: number, newFile: File | null) => {
    setFile(newFile);
    setFormValues((currentValues) =>
      currentValues.map((v) =>
        v.fieldID === fieldID && v.fieldType === "file_upload"
          ? { ...v, value: newFile }
          : v,
      ),
    );
  };

  useChromeListener(async (message) => {
    const { turndown } = await import("../../utils/turndown");
    if (message.action === "elementCaptured" && activeFieldID !== null) {
      const markdown = turndown(message.elementDetails.html);
      setFormValues((currentValues) =>
        currentValues.map((v) =>
          v.fieldID === activeFieldID && v.fieldType !== "file_upload"
            ? { ...v, value: markdown }
            : v,
        ),
      );
      setActiveFieldID(null);
    }
  });

  const fieldInput = (field: ToolField) => {
    const fieldValue = formValues.find((fv) => fv.fieldID === field.id);
    switch (field.field_type) {
      case "short_text":
        return (
          <Input
            disabled={isStreaming}
            sx={{
              width: "100%",
              color: theme.palette["gray-800"],
              border: "1px #C3C9CA solid",
            }}
            onChange={(e) => handleTextFieldChange(field.id, e.target.value)}
            value={getFieldValue(field) as string}
            size="md"
            color="primary"
          />
        );
      case "long_text":
        return (
          <Textarea
            disabled={isStreaming}
            readOnly={!!field.integration_key}
            minRows={4}
            sx={{
              width: "100%",
              color: theme.palette["gray-800"],
              border: "1px #C3C9CA solid",
            }}
            onChange={(e) => handleTextFieldChange(field.id, e.target.value)}
            value={getFieldValue(field) as string}
            size="md"
            color="primary"
          />
        );
      case "file_upload":
        return (
          <FileUploadField
            file={fieldValue?.value as File | null}
            setFile={(file) => handleFileFieldChange(field.id, file)}
          />
        );
      default:
        return null;
    }
  };

  const startGenerate = () => {
    const responses: Record<string, string> = {};
    for (const field of tool.fields) {
      if (field.field_type === "file_upload") {
        const val = getFieldValue(field) as File | null;
        responses[field.label] = val ? `${val.name} (filename)` : "";
      } else {
        const val = getFieldValue(field) as string;
        responses[field.label] = val;
      }
    }
    onClickGenerate(responses);
  };

  return (
    <>
      {integrationID && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "20px",
          }}
        >
          {integrationParameters.map((field) => (
            <FormControl key={field.integration_key}>
              <FormLabel
                sx={{
                  color: "#2A3031",
                  fontSize: "16px",
                  fontFamily: "Open Sans",
                  fontWeight: "600",
                }}
              >
                {field.label}
              </FormLabel>
              <Input
                disabled={isStreaming}
                sx={{
                  width: "100%",
                  color: theme.palette["gray-800"],
                  border: "1px #C3C9CA solid",
                }}
                onChange={async (e) => {
                  const queries: Record<string, string> = {};
                  if (field.integration_key) {
                    queries[field.integration_key] = e.target.value;
                  }
                  setIntegrationValuesLoading(true);
                  try {
                    const integrationValues = await getIntegrationValues(
                      integrationID,
                      queries,
                    );
                    setIntegrationParameterValid(true);
                    setIntegrationValuesLoading(false);
                    // Find all fields with an integration key which is a key of integrationValues
                    // and update their values to the value of the corresponding key in integrationValues
                    const premappedFields = tool.fields.filter(
                      (f) => !!f.integration_key,
                    );
                    for (const [key, value] of Object.entries(
                      integrationValues,
                    )) {
                      const field = premappedFields.find(
                        (f) => f.integration_key === key,
                      );
                      if (!field) continue;
                      handleTextFieldChange(field.id, value);
                    }
                  } catch (e) {
                    setIntegrationValuesLoading(false);
                    setIntegrationParameterValid(false);
                  }
                }}
                size="md"
                color="primary"
              />
            </FormControl>
          ))}
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          gap: "20px",
        }}
      >
        {tool.fields.map((field) => (
          <FormControl key={field.id}>
            <FormLabel
              sx={{
                color: "#2A3031",
                fontSize: "16px",
                fontFamily: "Open Sans",
                fontWeight: "600",
              }}
            >
              {field.label}
              {clientEnvironment.TARGET === "extension" && (
                <IconButton
                  onClick={() =>
                    setActiveFieldID(
                      activeFieldID === field.id ? null : field.id,
                    )
                  }
                  size="sm"
                  sx={{
                    backgroundColor:
                      activeFieldID === field.id ? "yellow" : "inherit",
                  }}
                >
                  <AdsClick sx={{ fill: theme.palette["blue-500"] }} />
                </IconButton>
              )}
            </FormLabel>
            {fieldInput(field)}
          </FormControl>
        ))}
      </Box>
      {(tool.fields.length > 0 || tool.allowFileUpload) && (
        <Button
          sx={{
            background: "#1298B6",
            alignSelf: "end",
            "&:hover": {
              background: theme.palette["blue-600"],
            },
            "&:active": {
              background: theme.palette["blue-700"],
            },
          }}
          onClick={isStreaming ? onClickCancel : startGenerate}
        >
          {isStreaming ? (
            <>
              <Stop />
              <Typography
                sx={{
                  color: "white",
                  fontWeight: "700",
                  marginLeft: "8px",
                  fontSize: "14px",
                }}
              >
                STOP
              </Typography>
            </>
          ) : (
            <>
              <AutoFixHigh />
              <Typography
                sx={{
                  color: "white",
                  marginLeft: "8px",
                  ...baseTextStyles,
                }}
              >
                GENERATE
              </Typography>
            </>
          )}
        </Button>
      )}
    </>
  );
};
