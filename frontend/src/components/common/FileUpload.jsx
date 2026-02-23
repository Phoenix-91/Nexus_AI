import { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FileUpload({ onFileSelect, accept = ".pdf", maxSize = 5 * 1024 * 1024 }) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');

    const validateFile = (file) => {
        if (!file) return false;

        if (maxSize && file.size > maxSize) {
            setError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
            return false;
        }

        if (accept && !file.name.toLowerCase().endsWith(accept.replace('.', ''))) {
            setError(`Only ${accept} files are allowed`);
            return false;
        }

        setError('');
        return true;
    };

    const handleFile = (file) => {
        if (validateFile(file)) {
            setSelectedFile(file);
            onFileSelect(file);
        }
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        handleFile(file);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
        setError('');
        onFileSelect(null);
    };

    return (
        <div className="w-full">
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                    "relative glass rounded-2xl p-8 border-2 border-dashed transition-all duration-300",
                    isDragging ? "border-purple-500 bg-purple-500/10" : "border-white/20",
                    "hover:border-purple-500/50"
                )}
            >
                <input
                    type="file"
                    accept={accept}
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {!selectedFile ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 rounded-full glass flex items-center justify-center">
                            <Upload className="w-8 h-8 text-purple-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-medium text-white">Drop your resume here</p>
                            <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                            <p className="text-xs text-gray-500 mt-2">PDF only, max {maxSize / (1024 * 1024)}MB</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-lg glass flex items-center justify-center">
                                <FileText className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium">{selectedFile.name}</p>
                                <p className="text-sm text-gray-400">
                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFile();
                            }}
                            className="w-8 h-8 rounded-full glass hover:bg-red-500/20 flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4 text-red-400" />
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
        </div>
    );
}
