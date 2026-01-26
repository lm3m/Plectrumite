import { request } from './client';
import type {
  Block,
  CreateBlockRequest,
  UpdateBlockRequest,
} from '../types';

export function addBlock(documentId: number, data: CreateBlockRequest): Promise<Block> {
  return request<Block>(`/documents/${documentId}/blocks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateBlock(blockId: number, data: UpdateBlockRequest): Promise<Block> {
  return request<Block>(`/blocks/${blockId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteBlock(blockId: number): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/blocks/${blockId}`, {
    method: 'DELETE',
  });
}

export function reorderBlocks(documentId: number, blockIds: number[]): Promise<Block[]> {
  return request<Block[]>(`/documents/${documentId}/blocks/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ block_ids: blockIds }),
  });
}
