"use client";

import { useState } from "react";
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Document } from "./document-manager";
/* eslint-disable @next/next/no-img-element */

interface DocumentPreviewProps {
  document: Document;
  documents?: Document[];
  onClose: () => void;
  onNavigate?: (document: Document) => void;
}

export function DocumentPreview({ document, documents, onClose, onNavigate }: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const isImage = document.file_type.startsWith("image/");
  const isPDF = document.file_type === "application/pdf";
  
  const currentIndex = documents?.findIndex(d => d.id === document.id) ?? -1;
  const hasPrev = documents && currentIndex > 0;
  const hasNext = documents && currentIndex < documents.length - 1;

  const handlePrev = () => {
    if (hasPrev && onNavigate) {
      onNavigate(documents[currentIndex - 1]);
      resetView();
    }
  };

  const handleNext = () => {
    if (hasNext && onNavigate) {
      onNavigate(documents[currentIndex + 1]);
      resetView();
    }
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "+" || e.key === "=") setZoom(z => Math.min(z + 0.25, 3));
    if (e.key === "-") setZoom(z => Math.max(z - 0.25, 0.5));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-white">
          <h3 className="font-medium truncate max-w-md">{document.file_name}</h3>
          {documents && (
            <p className="text-sm text-white/70">
              {currentIndex + 1} of {documents.length}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          {isImage && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(z - 0.25, 0.5)); }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                title="Zoom Out"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <span className="text-white text-sm min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(z + 0.25, 3)); }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                title="Zoom In"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setRotation(r => (r + 90) % 360); }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                title="Rotate"
              >
                <RotateCw className="h-5 w-5" />
              </button>
              <div className="w-px h-6 bg-white/30 mx-2" />
            </>
          )}
          
          <a
            href={document.storage_path}
            download={document.file_name}
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            title="Download"
          >
            <Download className="h-5 w-5" />
          </a>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      {/* Content */}
      <div
        className="max-w-[90vw] max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {isImage ? (
          <img
            src={document.storage_path}
            alt={document.file_name}
            className="max-w-full max-h-[80vh] object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          />
        ) : isPDF ? (
          <iframe
            src={document.storage_path}
            className="w-[80vw] h-[80vh] bg-white rounded-lg"
            title={document.file_name}
          />
        ) : (
          <div className="bg-card rounded-lg p-8 text-center">
            <p className="text-foreground mb-4">
              Preview not available for this file type.
            </p>
            <a
              href={document.storage_path}
              download={document.file_name}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Download File
            </a>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {documents && documents.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg max-w-[80vw] overflow-x-auto">
          {documents.slice(0, 10).map((doc, idx) => (
            <button
              key={doc.id}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate?.(doc);
                resetView();
              }}
              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                doc.id === document.id
                  ? "border-blue-500"
                  : "border-transparent hover:border-white/50"
              }`}
            >
              {doc.file_type.startsWith("image/") ? (
                <img
                  src={doc.storage_path}
                  alt={doc.file_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-xs">
                  {doc.file_type.split("/")[1]?.substring(0, 4).toUpperCase() || "FILE"}
                </div>
              )}
            </button>
          ))}
          {documents.length > 10 && (
            <div className="flex-shrink-0 w-16 h-16 rounded-md bg-gray-700 flex items-center justify-center text-white text-sm">
              +{documents.length - 10}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
