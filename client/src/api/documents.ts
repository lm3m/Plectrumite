import { request } from './client';
import type {
  Document,
  DocumentWithBlocks,
  CreateDocumentRequest,
  UpdateDocumentRequest,
} from '../types';

export function fetchDocuments(): Promise<Document[]> {
  return request<Document[]>('/documents');
}

export function fetchDocument(id: number): Promise<DocumentWithBlocks> {
  return request<DocumentWithBlocks>(`/documents/${id}`);
}

export function createDocument(data: CreateDocumentRequest): Promise<Document> {
  return request<Document>('/documents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateDocument(id: number, data: UpdateDocumentRequest): Promise<Document> {
  return request<Document>(`/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteDocument(id: number): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/documents/${id}`, {
    method: 'DELETE',
  });
}
