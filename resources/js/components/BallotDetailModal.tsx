// resources/js/components/BallotDetailModal.tsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, Plus, Trash2, GripVertical, ArrowUp, ArrowDown, Copy, Save, AlertCircle } from 'lucide-react';

interface Option {
    id: string;
    text: string;
    description?: string;
    order: number;
}

interface BallotDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    ballot: any;
    electionId: number;
}

export default function BallotDetailModal({ isOpen, onClose, ballot, electionId }: BallotDetailModalProps) {
    const [activeTab, setActiveTab] = useState('options');
    const [options, setOptions] = useState<Option[]>([]);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        max_selections: 1,
        min_selections: 1,
        randomize_options: false,
    });

    // Initialize form data when ballot changes
    useEffect(() => {
        if (ballot) {
            setFormData({
                title: ballot.title || '',
                description: ballot.description || '',
                max_selections: ballot.max_selections || 1,
                min_selections: ballot.min_selections || 1,
                randomize_options: ballot.randomize_options || false,
            });

            // Initialize options with proper structure
            if (ballot.options && Array.isArray(ballot.options)) {
                setOptions(ballot.options);
            } else {
                // Default options if none exist
                setOptions([
                    { id: '1', text: 'Option 1', order: 1 },
                    { id: '2', text: 'Option 2', order: 2 },
                ]);
            }
        }
    }, [ballot]);

    const tabs = [
        { id: 'options', label: 'Options' },
        { id: 'details', label: 'Details' },
        { id: 'attachments', label: 'Attachments' },
    ];

    const addOption = () => {
        const newOption: Option = {
            id: Date.now().toString(),
            text: 'New Option',
            order: options.length + 1,
        };
        setOptions([...options, newOption]);
    };

    const removeOption = (optionId: string) => {
        setOptions(options.filter(opt => opt.id !== optionId));
    };

    const updateOption = (optionId: string, text: string) => {
        setOptions(options.map(opt =>
            opt.id === optionId ? { ...opt, text } : opt
        ));
    };

    const moveOption = (optionId: string, direction: 'up' | 'down') => {
        const index = options.findIndex(opt => opt.id === optionId);
        if (direction === 'up' && index > 0) {
            const newOptions = [...options];
            [newOptions[index - 1], newOptions[index]] = [newOptions[index], newOptions[index - 1]];
            newOptions.forEach((opt, idx) => { opt.order = idx + 1; });
            setOptions(newOptions);
        } else if (direction === 'down' && index < options.length - 1) {
            const newOptions = [...options];
            [newOptions[index + 1], newOptions[index]] = [newOptions[index], newOptions[index + 1]];
            newOptions.forEach((opt, idx) => { opt.order = idx + 1; });
            setOptions(newOptions);
        }
    };

    const duplicateOption = (optionId: string) => {
        const optionToDuplicate = options.find(opt => opt.id === optionId);
        if (optionToDuplicate) {
            const newOption: Option = {
                ...optionToDuplicate,
                id: Date.now().toString(),
                text: `${optionToDuplicate.text} (Copy)`,
                order: options.length + 1,
            };
            setOptions([...options, newOption]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSave = async () => {
        if (!ballot) return;

        setSaving(true);

        const updateData = {
            ...formData,
            options: options,
        };

        router.put(`/ballots/${ballot.id}`, updateData, {
            onSuccess: () => {
                setSaving(false);
                onClose();
            },
            onError: () => {
                setSaving(false);
            },
        });
    };

    if (!isOpen || !ballot) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />

            <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-[#161615] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div>
                        <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-white">
                            {ballot.title || 'Edit Ballot'}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {ballot.type?.replace('_', ' ') || 'Ballot'} - {formData.max_selections} max selection(s)
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-[#e3e3e0] px-6 dark:border-[#3E3E3A]">
                    <div className="flex gap-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`border-b-2 px-1 py-3 text-sm font-medium transition-all ${
                                    activeTab === tab.id
                                        ? 'border-red-600 text-red-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'options' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-white">
                                    Options
                                </h3>
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
                                <div className="space-y-3">
                                    {options.map((option, index) => (
                                        <div
                                            key={option.id}
                                            className="group rounded-lg border border-[#e3e3e0] p-4 transition-all hover:shadow-md dark:border-[#3E3E3A]"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex cursor-move items-center text-gray-400">
                                                    <GripVertical className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={option.text}
                                                        onChange={(e) => updateOption(option.id, e.target.value)}
                                                        className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                        placeholder="Enter option text"
                                                    />
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">Order: {option.order || index + 1}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <button
                                                        onClick={() => moveOption(option.id, 'up')}
                                                        disabled={index === 0}
                                                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 dark:hover:bg-gray-800"
                                                    >
                                                        <ArrowUp className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => moveOption(option.id, 'down')}
                                                        disabled={index === options.length - 1}
                                                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 dark:hover:bg-gray-800"
                                                    >
                                                        <ArrowDown className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => duplicateOption(option.id)}
                                                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeOption(option.id)}
                                                        className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {ballot.type === 'multiple_choice' && (
                                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                    <p className="text-sm text-blue-800 dark:text-blue-400">
                                        Voters can select between {formData.min_selections} and {formData.max_selections} option(s)
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-white">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-white">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                    placeholder="Enter description (optional)"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-white">
                                        Max Selections
                                    </label>
                                    <input
                                        type="number"
                                        name="max_selections"
                                        value={formData.max_selections}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-white">
                                        Min Selections
                                    </label>
                                    <input
                                        type="number"
                                        name="min_selections"
                                        value={formData.min_selections}
                                        onChange={handleInputChange}
                                        min="0"
                                        max={formData.max_selections}
                                        className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="randomize_options"
                                    checked={formData.randomize_options}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600"
                                />
                                <label className="text-sm text-[#1b1b18] dark:text-white">
                                    Randomize options order
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'attachments' && (
                        <div className="rounded-lg border-2 border-dashed border-[#e3e3e0] p-8 text-center dark:border-[#3E3E3A]">
                            <p className="text-gray-500 dark:text-gray-400">
                                Attachment upload feature coming soon
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
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
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}