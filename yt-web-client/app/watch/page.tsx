import { Suspense } from "react";
import WatchClient from "./WatchClient";

export default function WatchPage() {
  return (
    <Suspense fallback={<div>Loading video...</div>}>
      <WatchClient />
    </Suspense>
  );
}
