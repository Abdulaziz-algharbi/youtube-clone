"use client";

import { useSearchParams } from "next/navigation";

export default function WatchClient() {
  const videoPrefix =
    "https://storage.googleapis.com/mihawk-53-processed-videos/";

  const videoSrc = useSearchParams().get("v");

  if (!videoSrc) {
    return <div>No video selected</div>;
  }

  return (
    <div>
      <h1>Watch Page</h1>
      <video controls src={videoPrefix + videoSrc} />
    </div>
  );
}
