"use client";

import { useSearchParams } from "next/navigation";

import React from "react";

const Watch = () => {
  const videoPrefix =
    "https://storage.googleapis.com/mihawk-53-processed-videos/";
  const videoSrc = useSearchParams().get("v");
  return (
    <div>
      <h1>Watch Page</h1>
      <video controls src={videoPrefix + videoSrc} />
    </div>
  );
};

export default Watch;
