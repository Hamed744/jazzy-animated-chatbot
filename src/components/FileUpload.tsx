import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  X,
  Download,
  Eye,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: "uploading" | "completed" | "error";
}

interface FileUploadProps {
  onFilesSelected: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

export default function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = [
    "image/*",
    "text/*",
    ".pdf",
    ".doc",
    ".docx",
    ".json",
    ".csv"
  ],
  className
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: "uploading" as const,
      preview: file.type.startsWith("image/") 
        ? URL.createObjectURL(file) 
        : undefined
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach(uploadFile => {
      simulateUpload(uploadFile.id);
    });

    onFilesSelected(newFiles);
  }, [onFilesSelected]);

  const simulateUpload = (fileId: string) => {
    const updateProgress = (progress: number) => {
      setUploadedFiles(prev =>
        prev.map(file =>
          file.id === fileId
            ? { 
                ...file, 
                progress,
                status: progress === 100 ? "completed" : "uploading"
              }
            : file
        )
      );
    };

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        toast({
          title: "آپلود موفق!",
          description: "فایل با موفقیت آپلود شد.",
        });
      }
      updateProgress(progress);
    }, 200);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize: maxSize * 1024 * 1024,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(({ errors }) => {
        errors.forEach(error => {
          toast({
            title: "خطا در آپلود",
            description: error.message,
            variant: "destructive"
          });
        });
      });
    }
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (fileType.includes("text") || fileType.includes("json")) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer hover:shadow-card",
          isDragActive
            ? "border-primary bg-primary/5 shadow-glow"
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
            isDragActive ? "bg-primary text-primary-foreground scale-110" : "bg-muted"
          )}>
            <Upload className="h-6 w-6" />
          </div>
          
          {isDragActive ? (
            <div>
              <p className="text-lg font-medium text-primary">فایل‌ها را اینجا رها کنید</p>
              <p className="text-sm text-muted-foreground">فایل‌های شما آماده آپلود هستند</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium">فایل‌های خود را اینجا کشیده و رها کنید</p>
              <p className="text-sm text-muted-foreground">
                یا برای انتخاب کلیک کنید • حداکثر {maxFiles} فایل • تا {maxSize}MB
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <span className="px-2 py-1 bg-muted rounded-full text-xs">تصاویر</span>
                <span className="px-2 py-1 bg-muted rounded-full text-xs">PDF</span>
                <span className="px-2 py-1 bg-muted rounded-full text-xs">Word</span>
                <span className="px-2 py-1 bg-muted rounded-full text-xs">متن</span>
                <span className="px-2 py-1 bg-muted rounded-full text-xs">JSON</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">فایل‌های آپلود شده:</h4>
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card animate-bounce-in"
              >
                {/* File Icon/Preview */}
                <div className="flex-shrink-0">
                  {uploadedFile.preview ? (
                    <div className="w-10 h-10 rounded border overflow-hidden">
                      <img
                        src={uploadedFile.preview}
                        alt={uploadedFile.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded border flex items-center justify-center bg-muted">
                      {getFileIcon(uploadedFile.file.type)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                  
                  {/* Progress Bar */}
                  {uploadedFile.status === "uploading" && (
                    <Progress 
                      value={uploadedFile.progress} 
                      className="h-1 mt-2" 
                    />
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2">
                  {uploadedFile.status === "uploading" && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  
                  {uploadedFile.status === "completed" && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          // Preview functionality
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          // Download functionality
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:text-destructive"
                    onClick={() => removeFile(uploadedFile.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}