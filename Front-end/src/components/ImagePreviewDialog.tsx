import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewDialogProps {
    open: boolean;
    onClose: () => void;
    imageUrl: string;
    imageName: string;
}

export function ImagePreviewDialog({ open, onClose, imageUrl, imageName }: ImagePreviewDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-black/95 border-0">
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* Close button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    >
                        <X className="h-5 w-5" />
                    </Button>

                    {/* Image */}
                    <img
                        src={imageUrl}
                        alt={imageName}
                        className="max-w-full max-h-[85vh] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Image name */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm">
                        {imageName}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
