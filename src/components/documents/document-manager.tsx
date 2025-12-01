"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  FileText,
  File,
  Upload,
  Trash2,
  Download,
  Eye,
  FolderOpen,
  MoreVertical,
  FileImage,
  FileSpreadsheet,
} from "lucide-react";
/* eslint-disable @next/next/no-img-element */
import { formatDistanceToNow } from "date-fns";

export type DocumentCategory = 
  | "photo"
  | "contract"
  | "inspection"
  | "appraisal"
  | "title"
  | "insurance"
  | "closing"
  | "other";

export interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  category: DocumentCategory;
  description?: string;
  version: number;
  uploaded_by: {
    full_name: string;
    email: string;
  };
  created_at: string;
  is_public: boolean;
}

interface DocumentManagerProps {
  documents: Document[];
  canUpload?: boolean;
  canDelete?: boolean;
  onUpload: (files: File[], category: DocumentCategory) => Promise<void>;
  onDelete: (documentId: string) => Promise<void>;
  onPreview?: (document: Document) => void;
}

const categoryConfig: Record<DocumentCategory, { label: string; icon: React.ReactNode; color: string }> = {
  photo: { label: "Photos", icon: <FileImage className="h-4 w-4" />, color: "text-blue-500" },
  contract: { label: "Contracts", icon: <FileText className="h-4 w-4" />, color: "text-purple-500" },
  inspection: { label: "Inspections", icon: <FileSpreadsheet className="h-4 w-4" />, color: "text-orange-500" },
  appraisal: { label: "Appraisals", icon: <FileText className="h-4 w-4" />, color: "text-green-500" },
  title: { label: "Title", icon: <FileText className="h-4 w-4" />, color: "text-indigo-500" },
  insurance: { label: "Insurance", icon: <FileText className="h-4 w-4" />, color: "text-cyan-500" },
  closing: { label: "Closing", icon: <FileText className="h-4 w-4" />, color: "text-emerald-500" },
  other: { label: "Other", icon: <File className="h-4 w-4" />, color: "text-gray-500" },
};

export function DocumentManager({
  documents,
  canUpload = true,
  canDelete = true,
  onUpload,
  onDelete,
  onPreview,
}: DocumentManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | "all">("all");
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>("photo");
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setPendingFiles(acceptedFiles);
    setShowUploadModal(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    disabled: !canUpload,
  });

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      await onUpload(pendingFiles, uploadCategory);
      setPendingFiles([]);
      setShowUploadModal(false);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredDocuments = selectedCategory === "all" 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  const documentsByCategory = documents.reduce((acc, doc) => {
    acc[doc.category] = (acc[doc.category] || 0) + 1;
    return acc;
  }, {} as Record<DocumentCategory, number>);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <FileImage className="h-8 w-8 text-blue-500" />;
    if (fileType === "application/pdf") return <FileText className="h-8 w-8 text-red-500" />;
    if (fileType.includes("spreadsheet") || fileType.includes("excel")) return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Documents</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md ${viewMode === "grid" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" : "text-muted-foreground hover:bg-muted"}`}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md ${viewMode === "list" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" : "text-muted-foreground hover:bg-muted"}`}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            selectedCategory === "all"
              ? "bg-blue-500 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All ({documents.length})
        </button>
        {Object.entries(categoryConfig).map(([key, config]) => {
          const count = documentsByCategory[key as DocumentCategory] || 0;
          if (count === 0 && key !== selectedCategory) return null;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as DocumentCategory)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5 ${
                selectedCategory === key
                  ? "bg-blue-500 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {config.icon}
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Upload Zone */}
      {canUpload && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-border hover:border-blue-400 hover:bg-muted/50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive ? (
              "Drop files here..."
            ) : (
              <>
                Drag & drop files here, or <span className="text-blue-500">browse</span>
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports images, PDFs, Word, and Excel files
          </p>
        </div>
      )}

      {/* Documents Grid/List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No documents found</p>
          {canUpload && (
            <p className="text-sm mt-1">Upload documents to get started</p>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onPreview={onPreview}
              onDelete={canDelete ? onDelete : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground hidden md:table-cell">Size</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground hidden lg:table-cell">Uploaded By</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground hidden sm:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.file_type)}
                      <div>
                        <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{doc.file_name}</p>
                        {doc.version > 1 && (
                          <span className="text-xs text-muted-foreground">v{doc.version}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-sm ${categoryConfig[doc.category].color}`}>
                      {categoryConfig[doc.category].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">{formatFileSize(doc.file_size)}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">{doc.uploaded_by.full_name}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onPreview && (
                        <button
                          onClick={() => onPreview(doc)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <a
                        href={doc.storage_path}
                        download={doc.file_name}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      {canDelete && (
                        <button
                          onClick={() => onDelete(doc.id)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Upload Documents</h3>
            
            <div className="space-y-4">
              {/* Selected Files */}
              <div>
                <label className="text-sm font-medium text-foreground">Selected Files</label>
                <div className="mt-2 space-y-2">
                  {pendingFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="text-sm font-medium text-foreground">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
                  className="mt-2 w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                >
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowUploadModal(false); setPendingFiles([]); }}
                className="px-4 py-2 text-sm font-medium rounded-md border border-border text-foreground hover:bg-muted"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentCard({
  document,
  onPreview,
  onDelete,
}: {
  document: Document;
  onPreview?: (doc: Document) => void;
  onDelete?: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const isImage = document.file_type.startsWith("image/");

  return (
    <div className="group relative border border-border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow">
      {/* Preview Area */}
      <div 
        className="aspect-square bg-muted flex items-center justify-center cursor-pointer"
        onClick={() => onPreview?.(document)}
      >
        {isImage ? (
          <img
            src={document.storage_path}
            alt={document.file_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-4">
            {document.file_type === "application/pdf" ? (
              <FileText className="h-12 w-12 mx-auto text-red-500" />
            ) : (
              <File className="h-12 w-12 mx-auto text-gray-500" />
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-foreground truncate" title={document.file_name}>
          {document.file_name}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs ${categoryConfig[document.category].color}`}>
            {categoryConfig[document.category].label}
          </span>
          {document.version > 1 && (
            <span className="text-xs text-muted-foreground">v{document.version}</span>
          )}
        </div>
      </div>

      {/* Actions Menu */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-md bg-white/90 dark:bg-gray-800/90 shadow-sm hover:bg-white dark:hover:bg-gray-800"
          >
            <MoreVertical className="h-4 w-4 text-foreground" />
          </button>
          
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-card rounded-md shadow-lg border border-border py-1">
                {onPreview && (
                  <button
                    onClick={() => { onPreview(document); setShowMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" /> Preview
                  </button>
                )}
                <a
                  href={document.storage_path}
                  download={document.file_name}
                  className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
                  onClick={() => setShowMenu(false)}
                >
                  <Download className="h-4 w-4" /> Download
                </a>
                {onDelete && (
                  <button
                    onClick={() => { onDelete(document.id); setShowMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
