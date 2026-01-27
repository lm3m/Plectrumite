import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type {
  Document,
  DocumentWithBlocks,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  CreateBlockRequest,
  BlockContent,
} from '../types';
import * as docApi from '../api/documents';
import * as blockApi from '../api/blocks';

export const useDocumentsStore = defineStore('documents', () => {
  const documents = ref<Document[]>([]);
  const currentDocument = ref<DocumentWithBlocks | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const sortedDocuments = computed(() =>
    [...documents.value].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
  );

  async function fetchDocuments() {
    loading.value = true;
    error.value = null;
    try {
      documents.value = await docApi.fetchDocuments();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  }

  async function fetchDocument(id: number) {
    loading.value = true;
    error.value = null;
    try {
      currentDocument.value = await docApi.fetchDocument(id);
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  }

  async function createDocument(data: CreateDocumentRequest): Promise<Document | null> {
    error.value = null;
    try {
      const doc = await docApi.createDocument(data);
      documents.value.unshift(doc);
      return doc;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e);
      return null;
    }
  }

  async function updateDocument(id: number, data: UpdateDocumentRequest) {
    error.value = null;
    try {
      const doc = await docApi.updateDocument(id, data);
      const idx = documents.value.findIndex(d => d.id === id);
      if (idx !== -1) documents.value[idx] = doc;
      if (currentDocument.value?.id === id) {
        currentDocument.value = { ...currentDocument.value, ...doc };
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e);
    }
  }

  async function deleteDocument(id: number) {
    error.value = null;
    try {
      await docApi.deleteDocument(id);
      documents.value = documents.value.filter(d => d.id !== id);
      if (currentDocument.value?.id === id) {
        currentDocument.value = null;
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e);
    }
  }

  async function addBlock(documentId: number, data: CreateBlockRequest) {
    error.value = null;
    try {
      const block = await blockApi.addBlock(documentId, data);
      if (currentDocument.value?.id === documentId) {
        currentDocument.value.blocks.push(block);
      }
      return block;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e);
      return null;
    }
  }

  async function updateBlock(blockId: number, content: BlockContent) {
    error.value = null;
    try {
      const updated = await blockApi.updateBlock(blockId, { content });
      if (currentDocument.value) {
        const idx = currentDocument.value.blocks.findIndex(b => b.id === blockId);
        if (idx !== -1) {
          currentDocument.value.blocks[idx] = updated;
        }
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e);
    }
  }

  async function deleteBlock(blockId: number) {
    error.value = null;
    try {
      await blockApi.deleteBlock(blockId);
      if (currentDocument.value) {
        currentDocument.value.blocks = currentDocument.value.blocks.filter(
          b => b.id !== blockId
        );
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e);
    }
  }

  async function reorderBlocks(documentId: number, blockIds: number[]) {
    error.value = null;
    try {
      const blocks = await blockApi.reorderBlocks(documentId, blockIds);
      if (currentDocument.value?.id === documentId) {
        currentDocument.value.blocks = blocks;
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e);
    }
  }

  return {
    documents,
    currentDocument,
    loading,
    error,
    sortedDocuments,
    fetchDocuments,
    fetchDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
  };
});
