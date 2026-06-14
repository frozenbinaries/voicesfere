import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { X, Plus, Trash2, GripVertical, ArrowUp, ArrowDown, Copy, Save, Upload, ImageOff } from 'lucide-react';

interface Option {
    id: number;
    title: string;
    description: string | null;
    should_display_a_photo: boolean;
    photo_url: string | null;       // stored URL from the server
    _photo_file?: File | null;      // pending local file (not yet uploaded)
    _photo_preview?: string | null; // local object URL for preview
    display_order: number;
}

interface OptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    ballot: any;
    electionId: number;
}

export default function OptionModal({ isOpen, onClose, ballot, electionId }: OptionModalProps) {
    const [options, setOptions] = useState<Option[]>([]);
    const [saving, setSaving] = useState(false);
    const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    useEffect(() => {
        if (ballot?.options && Array.isArray(ballot.options)) {
            setOptions(ballot.options.map((o: Option) => ({ ...o, _photo_file: null, _photo_preview: null })));
        } else if (ballot && !ballot.options) {
            setOptions([]);
        }
    }, [ballot]);

    // Revoke object URLs on unmount to avoid memory leaks
    useEffect(() => {
        return () => {
            options.forEach(o => { if (o._photo_preview) URL.revokeObjectURL(o._photo_preview); });
        };
    }, []);

    const addOption = () => {
        setOptions(prev => [...prev, {
            id: Date.now(),
            title: 'New Option',
            should_display_a_photo: false,
            photo_url: null,
            _photo_file: null,
            _photo_preview: null,
            description: null,
            display_order: prev.length + 1,
        }]);
    };

    const removeOption = (optionId: number) => {
        if (!confirm('Are you sure you want to delete this option?')) return;
        setOptions(prev => {
            const target = prev.find(o => o.id === optionId);
            if (target?._photo_preview) URL.revokeObjectURL(target._photo_preview);
            return prev.filter(o => o.id !== optionId);
        });
    };

    const updateOption = (optionId: number, fields: Partial<Option>) => {
        setOptions(prev => prev.map(o => o.id === optionId ? { ...o, ...fields } : o));
    };

    const handlePhotoChange = (optionId: number, file: File) => {
        const option = options.find(o => o.id === optionId);
        if (option?._photo_preview) URL.revokeObjectURL(option._photo_preview);
        const preview = URL.createObjectURL(file);
        updateOption(optionId, { _photo_file: file, _photo_preview: preview });
    };

    const removePhoto = (optionId: number) => {
        const option = options.find(o => o.id === optionId);
        if (option?._photo_preview) URL.revokeObjectURL(option._photo_preview);
        updateOption(optionId, { photo_url: null, _photo_file: null, _photo_preview: null });
        const input = fileInputRefs.current[optionId];
        if (input) input.value = '';
    };

    const moveOption = (optionId: number, direction: 'up' | 'down') => {
        setOptions(prev => {
            const index = prev.findIndex(o => o.id === optionId);
            if (direction === 'up' && index === 0) return prev;
            if (direction === 'down' && index === prev.length - 1) return prev;
            const next = [...prev];
            const swap = direction === 'up' ? index - 1 : index + 1;
            [next[swap], next[index]] = [next[index], next[swap]];
            next.forEach((o, i) => { o.display_order = i + 1; });
            return next;
        });
    };

    const duplicateOption = (optionId: number) => {
        const src = options.find(o => o.id === optionId);
        if (!src) return;
        setOptions(prev => [...prev, {
            ...src,
            id: Date.now(),
            title: `${src.title} (Copy)`,
            _photo_file: null,
            _photo_preview: null,
            display_order: prev.length + 1,
        }]);
    };

    const handleSave = () => {
        if (!ballot?.id) return;
        setSaving(true);

        // Build FormData so binary files travel alongside text fields
        const formData = new FormData();

        options.forEach((opt, index) => {
            const isNew = opt.id > 1_000_000;

            if (!isNew) formData.append(`options[${index}][id]`, String(opt.id));
            formData.append(`options[${index}][title]`,                  opt.title);
            formData.append(`options[${index}][description]`,            opt.description ?? '');
            formData.append(`options[${index}][should_display_a_photo]`, opt.should_display_a_photo ? '1' : '0');
            formData.append(`options[${index}][display_order]`,          String(opt.display_order));

            if (opt._photo_file) {
                // New file — send the binary; server will store it and derive photo_url
                formData.append(`options[${index}][photo]`, opt._photo_file);
            } else {
                // No new file — pass back the existing URL so the server keeps it
                formData.append(`options[${index}][photo_url]`, opt.photo_url ?? '');
            }
        });

        router.post(`/ballots/${ballot.id}/options`, formData, {
            forceFormData: true,
            onSuccess: () => { setSaving(false); onClose(); router.reload(); },
            onError:   () => { setSaving(false); },
        });
    };

    if (!isOpen || !ballot?.id) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />

            <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-[#161615] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div>
                        <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-white">
                            {ballot.title || 'Ballot'} – Options
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage options/candidates for this ballot
                        </p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-white">Options / Candidates</h3>
                        <button
                            onClick={addOption}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white transition-all hover:bg-red-700"
                        >
                            <Plus className="h-4 w-4" />
                            Add Option
                        </button>
                    </div>

                    {options.length === 0 ? (
                        <div className="rounded-lg border-2 border-dashed border-[#e3e3e0] p-8 text-center dark:border-[#3E3E3A]">
                            <p className="text-gray-500 dark:text-gray-400">No options yet. Click "Add Option" to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {options.map((option, index) => {
                                const previewSrc = option._photo_preview ?? option.photo_url ?? null;

                                return (
                                    <div key={option.id} className="group rounded-lg border border-[#e3e3e0] p-4 transition-all hover:shadow-md dark:border-[#3E3E3A]">
                                        <div className="flex items-start gap-3">
                                            <div className="flex cursor-move items-center pt-2 text-gray-400">
                                                <GripVertical className="h-5 w-5" />
                                            </div>

                                            <div className="flex-1 space-y-3">
                                                <input
                                                    type="text"
                                                    value={option.title}
                                                    onChange={(e) => updateOption(option.id, { title: e.target.value })}
                                                    className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm font-medium focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="Option title"
                                                />

                                                <textarea
                                                    value={option.description || ''}
                                                    onChange={(e) => updateOption(option.id, { description: e.target.value })}
                                                    rows={2}
                                                    className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="Option description (optional)"
                                                />

                                                {/* Photo section */}
                                                <div className="space-y-3">
                                                    <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                        <input
                                                            type="checkbox"
                                                            checked={option.should_display_a_photo}
                                                            onChange={(e) => {
                                                                updateOption(option.id, { should_display_a_photo: e.target.checked });
                                                                if (!e.target.checked) removePhoto(option.id);
                                                            }}
                                                            className="rounded border-gray-300 text-red-600 focus:ring-red-600"
                                                        />
                                                        Display photo
                                                    </label>

                                                    {option.should_display_a_photo && (
                                                        <div className="flex items-start gap-4">
                                                            {previewSrc ? (
                                                                <div className="relative shrink-0 group/photo">
                                                                    <img
                                                                        src={previewSrc}
                                                                        alt={option.title}
                                                                        className="h-24 w-24 rounded-lg object-cover border border-[#e3e3e0] dark:border-[#3E3E3A]"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removePhoto(option.id)}
                                                                        title="Remove photo"
                                                                        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity group-hover/photo:opacity-100 hover:bg-red-700"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-[#e3e3e0] bg-gray-50 dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
                                                                    <ImageOff className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                                                                </div>
                                                            )}

                                                            <div className="flex flex-col gap-2">
                                                                <input
                                                                    ref={(el) => { fileInputRefs.current[option.id] = el; }}
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="sr-only"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) handlePhotoChange(option.id, file);
                                                                    }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => fileInputRefs.current[option.id]?.click()}
                                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#e3e3e0] px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-[#3E3E3A] dark:text-gray-300 dark:hover:bg-gray-800"
                                                                >
                                                                    <Upload className="h-3.5 w-3.5" />
                                                                    {previewSrc ? 'Replace photo' : 'Upload photo'}
                                                                </button>
                                                                {previewSrc && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removePhoto(option.id)}
                                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                        Remove photo
                                                                    </button>
                                                                )}
                                                                <p className="text-xs text-gray-400 dark:text-gray-600">JPG, PNG, GIF, WebP · max 2 MB</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    Order: {option.display_order || index + 1}
                                                </div>
                                            </div>

                                            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                <button onClick={() => moveOption(option.id, 'up')} disabled={index === 0} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 dark:hover:bg-gray-800">
                                                    <ArrowUp className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => moveOption(option.id, 'down')} disabled={index === options.length - 1} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 dark:hover:bg-gray-800">
                                                    <ArrowDown className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => duplicateOption(option.id)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800">
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => removeOption(option.id)} className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <button onClick={onClose} className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Save Options
                    </button>
                </div>
            </div>
        </div>
    );
}