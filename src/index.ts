import fs from "node:fs";
import path from "node:path";

export default ({ action }: any, { services, getSchema }: any) => {
  const { FilesService } = services;

  console.log("[cypherscan-directus] hook registered");

  action("files.upload", async (meta: any) => {
    const apiKey = process.env.CYPHERSCAN_API_KEY;
    const apiBaseUrl =
      process.env.CYPHERSCAN_API_BASE_URL || "https://www.cyphernetsecurity.com";
    const blockInfected = process.env.CYPHERSCAN_BLOCK_INFECTED !== "false";

    if (!apiKey) {
      console.log("[cypherscan-directus] missing CYPHERSCAN_API_KEY");
      return;
    }

    try {
      const fileId = meta?.key;
      const filenameDisk = meta?.payload?.filename_disk;
      const filenameDownload = meta?.payload?.filename_download || filenameDisk;
      const contentType = meta?.payload?.type || "application/octet-stream";

      if (!fileId || !filenameDisk) return;

      const filePath = path.join(process.cwd(), "uploads", filenameDisk);

      if (!fs.existsSync(filePath)) {
        console.log("[cypherscan-directus] file not found:", filenameDownload);
        return;
      }

      const stats = fs.statSync(filePath);
      const buffer = fs.readFileSync(filePath);

      console.log("[cypherscan-directus] scanning:", filenameDownload);

      const presignRes = await fetch(`${apiBaseUrl}/api/v1/upload/presign`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          filename: filenameDownload,
          contentType,
          sizeBytes: stats.size,
        }),
      });

      const presign = await presignRes.json();

      if (!presignRes.ok || !presign?.url || !presign?.key) {
        console.log("[cypherscan-directus] presign failed:", presign?.code || presignRes.status);
        return;
      }

      const uploadRes = await fetch(presign.url, {
        method: "PUT",
        headers: {
          "content-type": contentType,
        },
        body: buffer,
      });

      if (!uploadRes.ok) {
        console.log("[cypherscan-directus] upload failed:", uploadRes.status);
        return;
      }

      const scanRes = await fetch(`${apiBaseUrl}/api/v1/scan`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          objectKey: presign.key,
        }),
      });

      const scan = await scanRes.json();

      if (!scanRes.ok) {
        console.log("[cypherscan-directus] scan failed:", scan?.code || scanRes.status);
        return;
      }

      console.log(
        `[cypherscan-directus] result: ${filenameDownload} verdict=${scan.verdict} blocked=${scan.blocked} scanId=${scan.scanId}`
      );

      if (blockInfected && scan.blocked === true) {
        const schema = await getSchema();
        const filesService = new FilesService({
          schema,
          accountability: null,
        });

        await filesService.deleteOne(fileId);

        console.log("[cypherscan-directus] blocked file deleted:", filenameDownload);
      }
    } catch (error) {
      console.error("[cypherscan-directus] error:", error);
    }
  });
};