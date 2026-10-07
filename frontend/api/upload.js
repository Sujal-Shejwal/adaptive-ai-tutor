import { handleUpload } from "@vercel/blob/client";

export default async function handler(request) {
  const body = await request.json();

  const jsonResponse = await handleUpload({
    body,
    request,

    onBeforeGenerateToken: async (pathname) => {
      return {
        allowedContentTypes: ["application/pdf"],
        maximumSizeInBytes: 50 * 1024 * 1024,
        addRandomSuffix: true,
      };
    },

    onUploadCompleted: async ({ blob }) => {
      console.log("PDF uploaded:", blob.url);
    },
  });

  return Response.json(jsonResponse);
}