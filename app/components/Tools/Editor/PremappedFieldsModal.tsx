import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Typography,
  useTheme,
} from "@mui/joy";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { type Dispatch, useState } from "react";
import {
  getIntegrationMany,
  getIntegrationParameters,
  getIntegrationSchema,
} from "../../../utils/api/teams";

export type CustomizedIntegration = {
  id: string;
  parameters: string[];
  externalFields: {
    label: string;
    integration_key: string;
    field_type: "long_text";
  }[];
};

type ToolDeletionModalType = {
  modalOpen: boolean;
  teamIDs: string[];
  onSave: (c: CustomizedIntegration) => void;
  onCancel: () => void;
  integrationID: string | undefined;
  setIntegrationID: Dispatch<React.SetStateAction<string | undefined>>;
};

export function PremappedFieldsModal(props: ToolDeletionModalType) {
  const theme = useTheme();

  const { data: integrations } = useQuery({
    queryKey: ["integrations", props.teamIDs] as const,
    queryFn: async ({ queryKey }) => {
      const [, teamIDs] = queryKey;
      return await getIntegrationMany(teamIDs);
    },
  });
  const [integrationParameterValues, setIntegrationParameterValues] = useState<
    Record<string, string>
  >({});

  const { data: integrationSchema } = useQuery({
    enabled: !!props.integrationID,
    queryKey: ["integration", props.integrationID, "parameters"] as const,
    queryFn: async ({ queryKey }) => {
      const [, integrationID] = queryKey;
      if (!integrationID)
        return {
          schema: [],
          parameters: [],
        };
      const props = {
        schema: await getIntegrationSchema(integrationID),
        parameters: await getIntegrationParameters(integrationID),
      };
      const newIntegrationParameterValues: Record<string, string> = {};
      for (const parameter of props.schema) {
        newIntegrationParameterValues[parameter] = parameter;
      }
      setIntegrationParameterValues(() => newIntegrationParameterValues);
      return props;
    },
  });

  const onChangeParameterInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIntegrationParameterValues({
      ...integrationParameterValues,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Modal open={props.modalOpen} onClose={props.onCancel}>
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
            Pre-Mapped Fields
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Select
            onChange={(_, v) => {
              if (typeof v === "string") {
                props.setIntegrationID(v);
              }
            }}
          >
            {integrations?.map((integration) => (
              <Option key={integration.id} value={integration.id}>
                {integration.name}
              </Option>
            ))}
          </Select>
          <h3>Integration Parameters</h3>
          {integrationSchema ? (
            <Box display={"flex"} flexDirection={"column"} gap={3}>
              {integrationSchema?.schema.map((parameter) => (
                <Box
                  key={parameter}
                  display={"flex"}
                  flexDirection={"column"}
                  gap={1}
                >
                  <FormControl>
                    <FormLabel>Field Name</FormLabel>
                    <Input
                      id={parameter}
                      name={parameter}
                      value={integrationParameterValues[parameter]}
                      onChange={onChangeParameterInput}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>External Field to Map to</FormLabel>
                    <Select defaultValue={parameter}>
                      {integrationSchema?.schema.map((parameter) => (
                        <Option key={`opt-${parameter}`} value={parameter}>
                          {parameter}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              ))}
            </Box>
          ) : (
            props.integrationID && <div>Loading...</div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="solid"
            disabled={!props.integrationID || !integrationSchema?.schema.length}
            onClick={() => {
              if (!props.integrationID) return;
              const fields = integrationSchema?.schema;
              const externalFields = fields?.map((field) => ({
                integration_key: field,
                label: integrationParameterValues[field] ?? "",
                field_type: "long_text" as const,
              }));
              props.onSave({
                id: props.integrationID,
                parameters:
                  integrationSchema?.parameters.map(
                    (parameter) => parameter.name,
                  ) ?? [],
                externalFields: externalFields ?? [],
              });
            }}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              props.onCancel();
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
