import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Upload,
  X,
  Camera,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CATEGORIES, PRIORITIES } from '@/utils/constants';
import { useAuth } from '@/hooks/useAuth';
import { issueService } from '@/services/issueService';
import { cn } from '@/lib/utils';

// Form validation schema
const issueFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  description: z.string().min(20, 'Please provide more details (min 20 characters)').max(1000, 'Description too long'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.string().min(1, 'Please select a priority level'),
});

type IssueFormData = z.infer<typeof issueFormSchema>;

interface IssueFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function IssueForm({ onSuccess, onCancel }: IssueFormProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [autoMergeInfo, setAutoMergeInfo] = useState<any>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      priority: 'medium',
    },
  });

  // Drag and drop file handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles].slice(0, 5)); // Max 5 files
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10485760, // 10MB
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Form submission handler
  const onSubmit = async (data: IssueFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const result = await issueService.createIssue(
        {
          title: data.title,
          description: data.description,
          category: data.category as any,
          priority: data.priority as any,
          attachments: files,
        },
        user.id
      );

      // Check if issue was auto-merged
      if ((result as any).autoMerged) {
        setAutoMergeInfo({
          similarityScore: (result as any).similarityScore,
          matchReasons: (result as any).matchReasons,
        });
      }

      setSubmitSuccess(true);
      reset();
      setFiles([]);

      // Show success state for 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        setAutoMergeInfo(null);
        onSuccess?.();
      }, 3000);
    } catch (error) {
      console.error('Failed to submit issue:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  // Success animation
  if (submitSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="mb-6 rounded-full bg-success-muted p-6"
        >
          <CheckCircle2 className="h-12 w-12 text-success" />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-foreground"
        >
          {autoMergeInfo ? 'Issue Merged with Existing Report!' : 'Issue Reported Successfully!'}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-2 text-muted-foreground max-w-md"
        >
          {autoMergeInfo
            ? `We found a similar issue (${Math.round(autoMergeInfo.similarityScore * 100)}% match) and merged your report with it. This helps us resolve issues faster!`
            : "We'll get back to you soon."}
        </motion.p>
        {autoMergeInfo && autoMergeInfo.matchReasons && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 flex flex-wrap gap-2 justify-center max-w-md"
          >
            {autoMergeInfo.matchReasons.map((reason: string, i: number) => (
              <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                ✓ {reason}
              </span>
            ))}
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-4 flex gap-1"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.8 + i * 0.1, type: 'spring' }}
            >
              <Sparkles className="h-5 w-5 text-warning" />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">Report an Issue</CardTitle>
          <CardDescription>
            Fill out the form below to report a problem. We'll assign it to the right team.
          </CardDescription>
          {user && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary-muted px-3 py-2 text-sm">
              <span className="font-medium text-primary">📍 {user.hostel}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Block {user.block}, Room {user.room}</span>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Input */}
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Issue Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Brief description of the issue..."
                className={cn(
                  'h-11 transition-all',
                  errors.title && 'border-destructive focus-visible:ring-destructive'
                )}
                {...register('title')}
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {errors.title && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  id="title-error"
                  className="flex items-center gap-1 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4" />
                  {errors.title.message}
                </motion.p>
              )}
            </motion.div>

            {/* Category and Priority Row */}
            <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2">
              {/* Category Select */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        className={cn(
                          'h-11',
                          errors.category && 'border-destructive'
                        )}
                        aria-label="Select issue category"
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <span>{cat.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Priority Select */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Priority Level <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-11" aria-label="Select priority level">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'h-2 w-2 rounded-full',
                                  priority.value === 'low' && 'bg-success',
                                  priority.value === 'medium' && 'bg-primary',
                                  priority.value === 'high' && 'bg-warning',
                                  priority.value === 'emergency' && 'bg-destructive'
                                )}
                              />
                              <span>{priority.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </motion.div>

            {/* Description Textarea */}
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Please describe the issue in detail. Include any relevant information that might help us resolve it faster..."
                rows={4}
                className={cn(
                  'resize-none transition-all',
                  errors.description && 'border-destructive focus-visible:ring-destructive'
                )}
                {...register('description')}
                aria-invalid={!!errors.description}
              />
              {errors.description && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4" />
                  {errors.description.message}
                </motion.p>
              )}
            </motion.div>

            {/* File Upload Zone */}
            <motion.div variants={itemVariants} className="space-y-2">
              <Label className="text-sm font-medium">
                Attachments <span className="text-muted-foreground">(optional)</span>
              </Label>
              <div
                {...getRootProps()}
                className={cn(
                  'relative cursor-pointer rounded-lg border-2 border-dashed p-6 transition-all duration-200',
                  'hover:border-primary hover:bg-primary-muted/30',
                  isDragActive && 'border-primary bg-primary-muted/50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                )}
                tabIndex={0}
                role="button"
                aria-label="Upload files"
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="mb-3 rounded-full bg-primary-muted p-3">
                    {isDragActive ? (
                      <Camera className="h-6 w-6 text-primary" />
                    ) : (
                      <Upload className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    or click to browse (max 5 files, 10MB each)
                  </p>
                </div>
              </div>

              {/* File Preview */}
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 flex flex-wrap gap-2"
                >
                  {files.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative flex items-center gap-2 rounded-lg bg-secondary px-3 py-2"
                    >
                      <span className="max-w-[150px] truncate text-sm">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="rounded-full p-1 transition-colors hover:bg-destructive-muted"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* Submit Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"
            >
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="sm:w-auto">
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Submit Issue
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
