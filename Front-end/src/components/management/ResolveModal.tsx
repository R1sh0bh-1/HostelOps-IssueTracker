import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Upload, X, FileImage, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Issue } from '@/types/issue';
import { cn } from '@/lib/utils';

interface ResolveModalProps {
  open: boolean;
  onClose: () => void;
  issue: Issue | null;
  onResolve: (issue: Issue, proofFiles: File[], remarks: string) => Promise<void>;
}

export function ResolveModal({ open, onClose, issue, onResolve }: ResolveModalProps) {
  const { toast } = useToast();
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [proofPreviews, setProofPreviews] = useState<{ file: File; preview: string | null }[]>([]);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const currentCount = proofFiles.length;
    const remainingSlots = 5 - currentCount;
    const filesToAdd = acceptedFiles.slice(0, remainingSlots);

    if (filesToAdd.length < acceptedFiles.length) {
      toast({
        title: "Maximum files reached",
        description: "You can upload up to 5 proof files",
        variant: "destructive",
      });
    }

    const newFiles = [...proofFiles, ...filesToAdd];
    setProofFiles(newFiles);

    // Generate previews for new files
    const newPreviews = [...proofPreviews];
    filesToAdd.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          newPreviews.push({ file, preview: reader.result as string });
          setProofPreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push({ file, preview: null });
      }
    });
    if (filesToAdd.some(f => !f.type.startsWith('image/'))) {
      setProofPreviews(newPreviews);
    }
  }, [proofFiles, proofPreviews, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,
    disabled: proofFiles.length >= 5,
  });

  const handleSubmit = async () => {
    if (proofFiles.length === 0 || !issue) {
      toast({
        title: "Proof Required",
        description: "Please upload at least one proof file before marking as resolved",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onResolve(issue, proofFiles, remarks);
      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setProofFiles([]);
    setProofPreviews([]);
    setRemarks('');
    onClose();
  };

  const removeFile = (index: number) => {
    setProofFiles(prev => prev.filter((_, i) => i !== index));
    setProofPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Mark Issue as Resolved
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="font-medium text-foreground">{issue?.title}</p>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {issue?.description}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Upload Proof of Resolution <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Upload up to 5 photos or documents showing the resolved issue
            </p>

            <AnimatePresence mode="wait">
              {proofFiles.length === 0 ? (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div
                    {...getRootProps()}
                    className={cn(
                      "cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {isDragActive ? "Drop the files here" : "Drag & drop or click to upload"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Images or PDF up to 10MB each (max 5 files)
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-2"
                >
                  {proofPreviews.map((item, index) => (
                    <div key={index} className="relative rounded-lg border bg-muted/30 p-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-3">
                        {item.preview ? (
                          <img
                            src={item.preview}
                            alt={`Proof ${index + 1}`}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                            <FileImage className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(item.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {proofFiles.length < 5 && (
                    <div
                      {...getRootProps()}
                      className={cn(
                        "cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors",
                        isDragActive
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <input {...getInputProps()} />
                      <p className="text-xs font-medium text-foreground">
                        + Add more files ({proofFiles.length}/5)
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks" className="text-sm font-medium">
              Resolution Remarks (Optional)
            </Label>
            <Textarea
              id="remarks"
              placeholder="Add any notes about how the issue was resolved..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={proofFiles.length === 0 || isSubmitting}
            className="bg-success hover:bg-success/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resolving...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Resolved
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
