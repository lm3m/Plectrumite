<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ImageContent } from '../../types';
import { uploadImage } from '../../api/uploads';

const props = defineProps<{
  content: ImageContent;
}>();

const emit = defineEmits<{
  (e: 'update', content: ImageContent): void;
}>();

const url = ref(props.content.url);
const caption = ref(props.content.caption ?? '');
const uploading = ref(false);
const error = ref('');
const dragging = ref(false);

watch(() => props.content, (c) => {
  url.value = c.url;
  caption.value = c.caption ?? '';
});

async function handleFile(file: File) {
  error.value = '';
  uploading.value = true;
  try {
    const result = await uploadImage(file);
    url.value = result.url;
    emit('update', { url: result.url, caption: caption.value });
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    uploading.value = false;
  }
}

function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) {
    handleFile(input.files[0]);
  }
}

function onDrop(event: DragEvent) {
  dragging.value = false;
  const file = event.dataTransfer?.files[0];
  if (file) {
    handleFile(file);
  }
}

function removeImage() {
  url.value = '';
  emit('update', { url: '', caption: caption.value });
}

let captionTimeout: ReturnType<typeof setTimeout> | null = null;

function handleCaptionInput() {
  if (captionTimeout) clearTimeout(captionTimeout);
  captionTimeout = setTimeout(() => {
    emit('update', { url: url.value, caption: caption.value });
  }, 800);
}
</script>

<template>
  <div class="image-block">
    <!-- Upload zone (no image yet) -->
    <div
      v-if="!url && !uploading"
      class="upload-zone"
      :class="{ dragging }"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <div class="upload-prompt">
        <span class="upload-icon">&#128247;</span>
        <span>Drag and drop an image here, or</span>
        <label class="upload-btn">
          Choose file
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            hidden
            @change="onFileSelect"
          >
        </label>
      </div>
      <p v-if="error" class="upload-error">{{ error }}</p>
    </div>

    <!-- Uploading indicator -->
    <div v-else-if="uploading" class="upload-zone uploading">
      <span class="upload-spinner"></span>
      <span>Uploading...</span>
    </div>

    <!-- Image display -->
    <div v-else class="image-display">
      <div class="image-container">
        <img :src="url" alt="Uploaded image">
        <button class="remove-btn" title="Remove image" @click="removeImage">&#10005;</button>
      </div>
      <input
        v-model="caption"
        class="caption-input"
        type="text"
        placeholder="Add a caption..."
        @input="handleCaptionInput"
      >
    </div>
  </div>
</template>

<style scoped>
.upload-zone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius);
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: border-color 0.15s, background 0.15s;
}

.upload-zone.dragging {
  border-color: var(--color-primary);
  background: rgba(124, 58, 237, 0.05);
}

.upload-zone.uploading {
  opacity: 0.7;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.upload-icon {
  font-size: 2rem;
}

.upload-btn {
  display: inline-block;
  padding: 6px 16px;
  background: var(--color-primary);
  color: white;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s;
}

.upload-btn:hover {
  background: var(--color-primary-hover);
}

.upload-error {
  color: var(--color-danger);
  font-size: 0.85rem;
  margin-top: 4px;
}

.upload-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.image-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-container {
  position: relative;
  display: inline-block;
}

.image-container img {
  max-width: 100%;
  border-radius: var(--radius);
  display: block;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 0.9rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: var(--color-danger);
}

.caption-input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 0.85rem;
  color: var(--color-text);
  background: transparent;
  outline: none;
}

.caption-input:focus {
  border-color: var(--color-primary);
}

.caption-input::placeholder {
  color: var(--color-text-muted);
}
</style>
