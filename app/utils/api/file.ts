import { supabase } from "~/lib/supabase.client";

export async function uploadFile({ file }: { file: File }) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    alert("only logged in users can upload files at the moment.");
    throw new Error("only logged in users can use tools at the moment.");
  }
  let filePath = "";

  if (file) {
    // ensure that file name doesn't have characters that suapbase storage can't handle:
    // specifically, it can handle any characters that s3 can handle, but not any characters that s3 can't handle:
    // https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html
    const fileName = file.name.replace(/[^a-zA-Z0-9\-_.]/g, "_");
    console.log("fileName", file.name, fileName);
    const { error, data } = await supabase.storage
      .from("files")
      .upload(`${crypto.randomUUID()}/${fileName}`, file, {});

    console.log(data, error);
    filePath = data?.path || "";

    if (error || !filePath) {
      console.error(error);
      // TODO: properly handle error
      alert("error uploading file");
      throw new Error("Error uploading file");
    }
  }

  return filePath;
}
