import { upload } from "@vercel/blob/client";

export async function uploadPdfToBlob(file) {
  const blob = await upload(file.name, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
    multipart: true,
  });

  return blob;
}