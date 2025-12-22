import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Admin SDK exactly once
initializeApp();

// Get Firestore instance
export const firestore = getFirestore();

const videoCollectionId = "videos";

export interface Video {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed";
  title?: string;
  description?: string;
}

async function getVideo(videoId: string): Promise<Video | null> {
  const snap = await firestore.collection(videoCollectionId).doc(videoId).get();

  return snap.exists ? (snap.data() as Video) : null;
}

export async function setVideo(videoId: string, video: Video) {
  await firestore
    .collection(videoCollectionId)
    .doc(videoId)
    .set(video, { merge: true });
}

export async function isVideoNew(videoId: string): Promise<boolean> {
  const video = await getVideo(videoId);
  return !video;
}
