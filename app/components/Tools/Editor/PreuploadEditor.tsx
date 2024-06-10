import type { FullTool } from "../../../utils/api/tools";
import { FileUploadField } from "../../FileUpload/FileUploadField";
import { UploadedFile } from "../../FileUpload/UploadedFile";
type PreuploadEditorProps = {
  preuploadedDocuments: FullTool["documents"];
  setPreuploadedDocuments: (documents: FullTool["documents"]) => void;
  preuploadedFile: File | null;
  setPreuploadedFile: (file: File | null) => void;
};
export const PreuploadEditor = ({
  preuploadedDocuments,
  setPreuploadedDocuments,
  preuploadedFile,
  setPreuploadedFile,
}: PreuploadEditorProps) => {
  return (
    <>
      {preuploadedDocuments.map((document) => (
        <UploadedFile
          key={document.id}
          doc={document}
          handleRemoveDoc={() => {
            setPreuploadedDocuments(
              preuploadedDocuments.filter(
                (uploadedDoc) => uploadedDoc.id !== document.id,
              ),
            );
          }}
        />
      ))}
      {preuploadedDocuments.length === 0 && (
        <FileUploadField
          file={preuploadedFile}
          setFile={(file) => {
            setPreuploadedFile(file);
          }}
        />
      )}
    </>
  );
};
