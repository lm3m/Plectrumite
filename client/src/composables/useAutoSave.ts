import { ref, onUnmounted } from 'vue';

export function useAutoSave(saveFn: () => Promise<void>, delayMs = 1000) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const isDirty = ref(false);
  const isSaving = ref(false);

  function markDirty() {
    isDirty.value = true;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(async () => {
      isSaving.value = true;
      try {
        await saveFn();
        isDirty.value = false;
      } finally {
        isSaving.value = false;
      }
    }, delayMs);
  }

  onUnmounted(() => {
    if (timeout) clearTimeout(timeout);
  });

  return { markDirty, isDirty, isSaving };
}
