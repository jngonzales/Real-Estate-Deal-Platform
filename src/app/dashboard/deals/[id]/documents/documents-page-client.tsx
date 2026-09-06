"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DealWorkspaceHeading } from "@/components/deals/deal-workspace-heading";
import { DocumentManager, Document, DocumentCategory } from "@/components/documents";
import { DocumentPreview } from "@/components/documents/document-preview";
import { uploadDealDocument, deleteDealDocument } from "@/lib/actions/attachment-actions";

interface DocumentsPageClientProps {
  dealId: string;
  dealAddress?: string | null;
  dealLocation?: string;
  documents: Document[];
  loadError?: boolean;
}

export function DocumentsPageClient({ dealId, dealAddress, dealLocation, documents: initialDocs, loadError }: DocumentsPageClientProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocs);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const handleUpload = async (files: File[], category: DocumentCategory) => {
    const failedFiles: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dealId", dealId);
      formData.append("category", category);
      
      try {
        const result = await uploadDealDocument(formData);
        if (!result.attachment) {
          failedFiles.push(file.name);
          continue;
        }

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
      } catch {
        failedFiles.push(file.name);
      }
    }

    if (failedFiles.length > 0) {
      toast.error("Some documents could not be uploaded", { description: failedFiles.join(", ") });
      if (failedFiles.length === files.length) throw new Error("No documents were uploaded");
    } else {
      toast.success(files.length === 1 ? "Document uploaded" : "Documents uploaded");
    }
  };

  const handleDelete = async (documentId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this document?");
    if (!confirmed) return;
    
    try {
      const result = await deleteDealDocument(documentId);
      if (!result.error) {
        setDocuments(prev => prev.filter(d => d.id !== documentId));
        toast.success("Document deleted");
        return;
      }
    } catch {
      // The file stays in the list when deletion fails.
    }
    toast.error("Could not delete the document. Try again.");
  };

  const handlePreview = (doc: Document) => {
    setPreviewDoc(doc);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DealWorkspaceHeading
        address={dealAddress}
        location={dealLocation}
        section="Documents"
        backHref={`/dashboard/deals/${dealId}`}
        backLabel="Back to deal"
      />

      {loadError && (
        <p role="alert" className="rounded-lg border border-border bg-card p-4 text-sm">
          Existing documents could not be loaded. Refresh the page to try again.
        </p>
      )}
      <section aria-label="Deal documents" className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-6">
        <DocumentManager
          documents={documents}
          documentsUnavailable={loadError}
          onUpload={handleUpload}
          onDelete={handleDelete}
          onPreview={handlePreview}
        />
      </section>

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
