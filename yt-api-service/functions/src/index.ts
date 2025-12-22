import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import {
  beforeUserCreated,
  AuthUserRecord,
} from "firebase-functions/v2/identity";
import {logger} from "firebase-functions";
import {Storage} from "@google-cloud/storage";
import {onCall, HttpsError} from "firebase-functions/v2/https";

// Initialize Admin SDK once
initializeApp();
const db = getFirestore();
const storage = new Storage();

const rawVideoBucketName = "mihawk-53-raw-videos";

const videoCollectionId = "videos";

export interface Video {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed";
  title?: string;
  description?: string;
}

export const enforceFirestoreUserOnCreate = beforeUserCreated(async (event) => {
  const user = event.data as AuthUserRecord;

  const userInfo = {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? "Guest",
    photoURL: user.photoURL ?? null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastSignInTime: admin.firestore.FieldValue.serverTimestamp(),
  };

  logger.info(`beforeUserCreated trigger for ${userInfo.email}`);

  try {
    const userRef = db.collection("users").doc(userInfo.uid);
    const docSnap = await userRef.get();

    if (docSnap.exists) {
      // Update only the lastSignInTime if user already exists
      await userRef.update({
        lastSignInTime: admin.firestore.FieldValue.serverTimestamp(),
      });
      logger.info(`Updated existing user document: ${userInfo.uid}`);
      return;
    }

    // Create new user document
    await userRef.set(userInfo);
    logger.info(`Created Firestore user document for UID: ${userInfo.uid}`);
  } catch (error) {
    logger.error(
      `Error creating/updating Firestore user for ${userInfo.email}:`,
      error
    );
    throw new Error(`Firestore write failed: ${error}`);
  }
});

export const generateUploadUrl = onCall(
  {maxInstances: 1},
  async (request) => {
    // Check if the user is authenticated
    if (!request.auth) {
      throw new HttpsError(
        "failed-precondition",
        "The function must be called while authenticated"
      );
    }

    const auth = request.auth;
    const data = request.data;
    const bucket = storage.bucket(rawVideoBucketName);

    // Generate a unique filename
    const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;

    // Get a v4 signed URL for uploading file
    const [url] = await bucket.file(fileName).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });
    return {url, fileName};
  }
);

export const getVideos = onCall({maxInstances: 1}, async () => {
  const snapshot = await db.collection(videoCollectionId).limit(10).get();
  return snapshot.docs.map((doc) => doc.data());
});
