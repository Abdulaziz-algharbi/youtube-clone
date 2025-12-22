import express from "express";
import {
  convertVideo,
  deleteProcessedVideo,
  deleteRawVideo,
  downloadRawVideo,
  setupDirectories,
  uploadProcessedVideo,
} from "./storage";
import { isVideoNew, setVideo } from "./firestore";

const app = express();
app.use(express.json());

app.post("/process-video", async (req, res) => {
  // ✅ ACK Pub/Sub immediately
  res.status(204).send();

  try {
    const message = Buffer.from(req.body.message.data, "base64").toString(
      "utf8"
    );
    const data = JSON.parse(message);

    if (!data.name) {
      throw new Error("Invalid message payload received.");
    }

    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;
    const videoId = inputFileName.split(".")[0];

    if (!(await isVideoNew(videoId))) {
      console.log(`Video ${videoId} already handled`);
      return;
    }

    await setVideo(videoId, {
      id: videoId,
      uid: videoId.split("-")[0],
      status: "processing",
    });

    await downloadRawVideo(inputFileName);
    console.log("START convertVideo", { inputFileName, outputFileName });
    await convertVideo(inputFileName, outputFileName);
    console.log("END convertVideo");

    await uploadProcessedVideo(outputFileName);

    console.log("About to mark processed", { videoId, outputFileName });
    await setVideo(videoId, { status: "processed", filename: outputFileName });
    console.log("Marked processed", { videoId });

    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName),
    ]);

    console.log(`Video ${videoId} processed successfully`);
  } catch (err) {
    console.error("Video processing failed:", err);
  }
});

const port = Number(process.env.PORT);

app.listen(port, "0.0.0.0", async () => {
  await setupDirectories();
  console.log(`Video Processing service listening on port ${port}`);
});
