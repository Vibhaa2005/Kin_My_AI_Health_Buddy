"use client";

import { useEffect } from "react";
import { useKinStore } from "@/lib/store";

export default function StoreHydrator() {
  useEffect(() => {
    useKinStore.persist.rehydrate();
  }, []);
  return null;
}
