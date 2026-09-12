"use client";

import { useEffect } from "react";
import { useProjectStore } from "@/stores/useProjectStore";
import { useRecipientStore } from "@/stores/useRecipientStore";

export function StoreHydration() {
  useEffect(() => {
    const unsubscribeProjects = useProjectStore.persist.onFinishHydration(() => {
      useProjectStore.setState({ hasHydrated: true });
    });
    const unsubscribeRecipients = useRecipientStore.persist.onFinishHydration(() => {
      useRecipientStore.setState({ hasHydrated: true });
    });
    useProjectStore.persist.rehydrate();
    useRecipientStore.persist.rehydrate();
    return () => {
      unsubscribeProjects();
      unsubscribeRecipients();
    };
  }, []);

  return null;
}
