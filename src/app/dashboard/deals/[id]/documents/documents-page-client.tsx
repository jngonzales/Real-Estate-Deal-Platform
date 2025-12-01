"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DocumentManager, Document, DocumentCategory } from "@/components/documents";
import { DocumentPreview } from "@/components/documents/document-preview";
import { uploadDealDocument, deleteDealDocument } from "@/lib/actions/attachment-actions";

interface DocumentsPageClientProps {
  dealId: string;
  dealAddress: string;
  documents: Document[];
}

export function DocumentsPageClient({ dealId, dealAddress, documents: initialDocs }: DocumentsPageClientProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocs);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const handleUpload = async (files: File[], category: DocumentCategory) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dealId", dealId);
      formData.append("category", category);
      
      const result = await uploadDealDocument(formData);
      if (result.attachment) {
        const newDoc: Document = {
          id: result.attachment.id,
          file_name: result.attachment.file_name,
          file_type: result.attachment.file_type || "application/octet-stream",
          file_size: result.attachment.file_size || 0,
          storage_path: result.attachment.storage_path,
          category: (result.attachment.category || "other") as DocumentCategory,
          description: result.attachment.description || undefined,
          version: 1,
          uploaded_by: {
            full_name: "You",
            email: "",
          },
          created_at: result.attachment.created_at,
          is_public: false,
        };
        setDocuments(prev => [newDoc, ...prev]);
      }
    }
  };

  const handleDelete = async (documentId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this document?");
    if (!confirmed) return;
    
    const result = await deleteDealDocument(documentId);
    if (!result.error) {
      setDocuments(prev => prev.filter(d => d.id !== documentId));
    }
  };

  const handlePreview = (doc: Document) => {
    setPreviewDoc(doc);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/deals/${dealId}`}
          className="p-2 rounded-lg hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground">{dealAddress}</p>
        </div>
      </div>

      {/* Document Manager */}
      <div className="bg-card rounded-lg border border-border p-6">
        <DocumentManager
          documents={documents}
          onUpload={handleUpload}
          onDelete={handleDelete}
          onPreview={handlePreview}
        />
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <DocumentPreview
          document={previewDoc}
          documents={documents}
          onClose={() => setPreviewDoc(null)}
          onNavigate={setPreviewDoc}
        />
      )}
    </div>
  );
}
