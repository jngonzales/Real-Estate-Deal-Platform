"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { createWorker } from "tesseract.js";

interface ExtractedData {
  address?: string;
  price?: number;
  sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  lotSize?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
}

interface DocumentOCRProps {
  imageUrl: string;
  onExtractedData?: (data: ExtractedData) => void;
}

export function DocumentOCR({ imageUrl, onExtractedData }: DocumentOCRProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [progress, setProgress] = useState(0);

  const extractText = async () => {
    setIsExtracting(true);
    setProgress(0);

    try {
      // Create Tesseract worker
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      // Recognize text from image
      const {
        data: { text },
      } = await worker.recognize(imageUrl);

      await worker.terminate();

      setExtractedText(text);

      // Parse the extracted text
      const parsedData = parsePropertyData(text);
      setExtractedData(parsedData);

      if (onExtractedData) {
        onExtractedData(parsedData);
      }

      toast.success("Text extracted successfully!");
    } catch (error) {
      console.error("OCR Error:", error);
      toast.error("Failed to extract text from image");
    } finally {
      setIsExtracting(false);
      setProgress(0);
    }
  };

  const parsePropertyData = (text: string): ExtractedData => {
    const data: ExtractedData = {};

    // Address patterns
    const addressPattern =
      /(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Way|Circle|Cir|Place|Pl))/i;
    const addressMatch = text.match(addressPattern);
    if (addressMatch) {
      data.address = addressMatch[1].trim();
    }

    // Price patterns
    const pricePatterns = [
      /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
      /price[:\s]+\$?\s*(\d{1,3}(?:,\d{3})*)/i,
      /asking[:\s]+\$?\s*(\d{1,3}(?:,\d{3})*)/i,
    ];
    for (const pattern of pricePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.price = parseInt(match[1].replace(/,/g, ""));
        break;
      }
    }

    // Square footage
    const sqftPatterns = [
      /(\d{1,5})\s*(?:sq\.?\s*ft\.?|square feet|sqft)/i,
      /square footage[:\s]+(\d{1,5})/i,
    ];
    for (const pattern of sqftPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.sqft = parseInt(match[1]);
        break;
      }
    }

    // Bedrooms
    const bedPatterns = [/(\d+)\s*(?:bed|bedroom|br)/i, /bedrooms?[:\s]+(\d+)/i];
    for (const pattern of bedPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.bedrooms = parseInt(match[1]);
        break;
      }
    }

    // Bathrooms
    const bathPatterns = [
      /(\d+\.?\d*)\s*(?:bath|bathroom|ba)/i,
      /bathrooms?[:\s]+(\d+\.?\d*)/i,
    ];
    for (const pattern of bathPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.bathrooms = parseFloat(match[1]);
        break;
      }
    }

    // Year built
    const yearPattern = /(?:built|year)[:\s]+(19\d{2}|20\d{2})/i;
    const yearMatch = text.match(yearPattern);
    if (yearMatch) {
      data.yearBuilt = parseInt(yearMatch[1]);
    }

    // Lot size
    const lotPattern = /(\d+\.?\d*)\s*(?:acres?|ac)/i;
    const lotMatch = text.match(lotPattern);
    if (lotMatch) {
      data.lotSize = `${lotMatch[1]} acres`;
    }

    // Owner name (common patterns)
    const namePatterns = [
      /owner[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
      /seller[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    ];
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.ownerName = match[1].trim();
        break;
      }
    }

    // Phone number
    const phonePattern = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/;
    const phoneMatch = text.match(phonePattern);
    if (phoneMatch) {
      data.ownerPhone = phoneMatch[1];
    }

    // Email
    const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const emailMatch = text.match(emailPattern);
    if (emailMatch) {
      data.ownerEmail = emailMatch[1];
    }

    return data;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    toast.success("Text copied to clipboard");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          OCR - Extract Property Data
        </CardTitle>
        <CardDescription>
          Automatically extract property information from this image
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Extract Button */}
        <Button
          onClick={extractText}
          disabled={isExtracting}
          className="w-full"
          size="lg"
        >
          {isExtracting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Extracting... {progress}%
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Extract Text from Image
            </>
          )}
        </Button>

        {/* Progress Bar */}
        {isExtracting && (
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Extracted Data */}
        {extractedData && Object.keys(extractedData).length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Data Extracted Successfully</span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-muted/50 p-4 rounded-lg">
              {extractedData.address && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="font-medium">{extractedData.address}</p>
                </div>
              )}
              {extractedData.price && (
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-medium">
                    ${extractedData.price.toLocaleString()}
                  </p>
                </div>
              )}
              {extractedData.sqft && (
                <div>
                  <p className="text-xs text-muted-foreground">Square Feet</p>
                  <p className="font-medium">{extractedData.sqft.toLocaleString()}</p>
                </div>
              )}
              {extractedData.bedrooms && (
                <div>
                  <p className="text-xs text-muted-foreground">Bedrooms</p>
                  <p className="font-medium">{extractedData.bedrooms}</p>
                </div>
              )}
              {extractedData.bathrooms && (
                <div>
                  <p className="text-xs text-muted-foreground">Bathrooms</p>
                  <p className="font-medium">{extractedData.bathrooms}</p>
                </div>
              )}
              {extractedData.yearBuilt && (
                <div>
                  <p className="text-xs text-muted-foreground">Year Built</p>
                  <p className="font-medium">{extractedData.yearBuilt}</p>
                </div>
              )}
              {extractedData.lotSize && (
                <div>
                  <p className="text-xs text-muted-foreground">Lot Size</p>
                  <p className="font-medium">{extractedData.lotSize}</p>
                </div>
              )}
              {extractedData.ownerName && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Owner Name</p>
                  <p className="font-medium">{extractedData.ownerName}</p>
                </div>
              )}
              {extractedData.ownerPhone && (
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{extractedData.ownerPhone}</p>
                </div>
              )}
              {extractedData.ownerEmail && (
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-xs">{extractedData.ownerEmail}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Raw Text */}
        {extractedText && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium mb-2">
              View Raw Extracted Text
            </summary>
            <div className="relative">
              <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-48 whitespace-pre-wrap">
                {extractedText}
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={copyToClipboard}
              >
                Copy
              </Button>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
