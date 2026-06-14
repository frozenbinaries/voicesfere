// resources/js/components/CreateBallotModal.tsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, ChevronLeft, ChevronRight, Check, AlertCircle, FileText, ListOrdered, Settings, Eye } from 'lucide-react';

interface CreateBallotModalProps {
    isOpen: boolean;
    onClose: () => void;
    electionId: number;
}

type BallotType = 'single_choice' | 'multiple_choice' | 'ranked_choice' | 'rating' | 'text';

interface BallotTypeInfo {
    id: BallotType;
    label: string;
    description: string;
    icon: string;
    details: string;
}

const ballotTypes: BallotTypeInfo[] = [
    {
        id: 'single_choice',
        label: 'Single Choice',
        description: 'Voters select one option from a list',
        icon: '⚪',
        details: 'Voters can select only one option from the list',
    },
    {
        id: 'multiple_choice',
        label: 'Multiple Choice',
        description: 'Voters select multiple options from a list',
        icon: '☑️',
        details: 'Voters can select one or many options',
    },
    {
        id: 'ranked_choice',
        label: 'Ranked Choice',
        description: 'Voters rank options in order of preference',
        icon: '📊',
        details: 'Voters rank options from most preferred to least preferred',
    },
    {
        id: 'rating',
        label: 'Rating Scale',
        description: 'Voters rate options on a scale (e.g., 1-5)',
        icon: '⭐',
        details: 'Voters rate options on a numerical scale',
    },
    {
        id: 'text',
        label: 'Text Response',
        description: 'Voters provide written answers',
        icon: '📝',
        details: 'Voters provide open-ended text responses',
    },
];

export default function CreateBallotModal({ isOpen, onClose, electionId }: CreateBallotModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    const [animating, setAnimating] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        type: 'single_choice' as BallotType,
        title: '',
        description: '',
        max_selections: 1,
        min_selections: 1,
        randomize_options: false,
    });

    const handleTypeSelect = (type: BallotType) => {
        // Reset min/max based on type
        let maxSelections = 1;
        let minSelections = 1;

        if (type === 'multiple_choice') {
            maxSelections = 2;
            minSelections = 1;
        } else if (type === 'ranked_choice') {
            maxSelections = 3;
            minSelections = 1;
        } else if (type === 'rating') {
            maxSelections = 5;
            minSelections = 1;
        } else if (type === 'text') {
            maxSelections = 0;
            minSelections = 0;
        }

        setFormData({
            ...formData,
            type,
            max_selections: maxSelections,
            min_selections: minSelections
        });

        setDirection('forward');
        setAnimating(true);
        setTimeout(() => {
            setStep(2);
            setTimeout(() => setAnimating(false), 50);
        }, 200);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const validateStep = () => {
        if (step === 2) {
            if (!formData.title.trim()) {
                setError('Please enter a ballot title');
                return false;
            }
            if (formData.title.length > 200) {
                setError('Title must be less than 200 characters');
                return false;
            }
        }

        if (step === 3) {
            if (formData.type !== 'text') {
                if (formData.max_selections < 1) {
                    setError('Max selections must be at least 1');
                    return false;
                }
                if (formData.max_selections < formData.min_selections) {
                    setError('Max selections cannot be less than min selections');
                    return false;
                }
                if (formData.min_selections < 0) {
                    setError('Min selections cannot be negative');
                    return false;
                }
            }
        }

        setError(null);
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setDirection('forward');
            setAnimating(true);
            setTimeout(() => {
                setStep(step + 1);
                setTimeout(() => setAnimating(false), 50);
            }, 200);
        }
    };

    const handleBack = () => {
        setDirection('backward');
        setAnimating(true);
        setTimeout(() => {
            setStep(step - 1);
            setTimeout(() => setAnimating(false), 50);
        }, 200);
        setError(null);
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setLoading(true);
        setError(null);

        try {
            router.post(`/elections/${electionId}/ballots`, formData, {
                onSuccess: () => {
                    onClose();
                    resetForm();
                },
                onError: (errors) => {
                    setError(Object.values(errors).join(', '));
                },
            });
        } catch (err) {
            setError('Failed to create ballot. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setFormData({
            type: 'single_choice',
            title: '',
            description: '',
            max_selections: 1,
            min_selections: 1,
            randomize_options: false,
        });
        setError(null);
        setDirection('forward');
        setAnimating(false);
    };

    const getSelectedTypeInfo = () => {
        return ballotTypes.find(t => t.id === formData.type);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in zoom-in duration-200">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 animate-in fade-in duration-200" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-[#161615] animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div>
                        <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-white">
                            Create New Ballot
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Step {step} of 4
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="border-b border-[#e3e3e0] px-6 py-3 dark:border-[#3E3E3A]">
                    <div className="flex items-center justify-between">
                        {[
                            { step: 1, label: 'Type', icon: ListOrdered },
                            { step: 2, label: 'Details', icon: FileText },
                            { step: 3, label: 'Settings', icon: Settings },
                            { step: 4, label: 'Confirm', icon: Eye },
                        ].map((s) => {
                            const Icon = s.icon;
                            const isActive = step === s.step;
                            const isCompleted = step > s.step;

                            return (
                                <div key={s.step} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
                                            isActive
                                                ? 'scale-110 bg-red-600 text-white shadow-lg'
                                                : isCompleted
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                            {isCompleted ? <Check className="h-4 w-4 animate-in fade-in zoom-in" /> : s.step}
                                        </div>
                                        <span className={`mt-1 text-xs transition-all duration-300 ${
                                            isActive
                                                ? 'scale-105 text-red-600 font-medium dark:text-red-500'
                                                : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                            {s.label}
                                        </span>
                                    </div>
                                    {s.step < 4 && (
                                        <div className={`mx-4 h-px w-12 transition-all duration-500 ${
                                            step > s.step ? 'bg-green-600 scale-x-100' : 'bg-gray-300 scale-x-50 dark:bg-gray-700'
                                        }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content with Animation */}
                <div className="relative overflow-hidden p-6">
                    {error && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 animate-in fade-in slide-in-from-top-2 dark:bg-red-900/20 dark:text-red-400">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {/* Step 1: Select Ballot Type */}
                    {step === 1 && (
                        <div className={`space-y-4 transition-all duration-300 ${
                            animating
                                ? direction === 'forward'
                                    ? 'animate-out fade-out slide-out-to-left'
                                    : 'animate-out fade-out slide-out-to-right'
                                : 'animate-in fade-in slide-in-from-right duration-300'
                        }`}>
                            <h3 className="font-medium text-[#1b1b18] dark:text-white animate-in fade-in slide-in-from-bottom-2 duration-300">
                                Choose Ballot Question Type
                            </h3>
                            <div className="grid gap-3">
                                {ballotTypes.map((type, idx) => (
                                    <button
                                        key={type.id}
                                        onClick={() => handleTypeSelect(type.id)}
                                        className="flex items-start gap-3 rounded-lg border border-[#e3e3e0] p-4 text-left transition-all hover:border-red-600 hover:bg-red-50 hover:scale-102 dark:border-[#3E3E3A] dark:hover:border-red-600 dark:hover:bg-red-900/20 animate-in fade-in slide-in-from-bottom-2"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <span className="text-2xl transition-transform group-hover:scale-110">{type.icon}</span>
                                        <div className="flex-1">
                                            <div className="font-medium text-[#1b1b18] dark:text-white">
                                                {type.label}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {type.description}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                                {type.details}
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Basic Information */}
                    {step === 2 && (
                        <div className={`space-y-4 transition-all duration-300 ${
                            animating
                                ? direction === 'forward'
                                    ? 'animate-out fade-out slide-out-to-left'
                                    : 'animate-out fade-out slide-out-to-right'
                                : 'animate-in fade-in slide-in-from-right duration-300'
                        }`}>
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-white">
                                    Ballot Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Presidential Election, Class Representative, etc."
                                    className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 transition-all focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                    maxLength={200}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    {formData.title.length}/200 characters
                                </p>
                            </div>

                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '100ms' }}>
                                <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-white">
                                    Description (Optional)
                                </label>
                                <div className="rounded-lg border border-[#e3e3e0] dark:border-[#3E3E3A]">
                                    <div className="flex gap-1 border-b border-[#e3e3e0] p-2 dark:border-[#3E3E3A]">
                                        {['B', 'I', 'U', 'S'].map((btn, idx) => (
                                            <button
                                                key={btn}
                                                className="rounded px-2 py-1 text-sm transition-all hover:bg-gray-100 hover:scale-105 dark:hover:bg-gray-800"
                                                style={{ animationDelay: `${idx * 50}ms` }}
                                            >
                                                {btn}
                                            </button>
                                        ))}
                                        <div className="w-px bg-gray-300 dark:bg-gray-700" />
                                        {['• List', '1. List'].map((btn, idx) => (
                                            <button
                                                key={btn}
                                                className="rounded px-2 py-1 text-sm transition-all hover:bg-gray-100 hover:scale-105 dark:hover:bg-gray-800"
                                                style={{ animationDelay: `${(idx + 4) * 50}ms` }}
                                            >
                                                {btn}
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={5}
                                        placeholder="Provide additional context or instructions for voters..."
                                        className="w-full rounded-b-lg px-3 py-2 transition-all focus:outline-none dark:bg-[#0a0a0a] dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Settings */}
                    {step === 3 && (
                        <div className={`space-y-4 transition-all duration-300 ${
                            animating
                                ? direction === 'forward'
                                    ? 'animate-out fade-out slide-out-to-left'
                                    : 'animate-out fade-out slide-out-to-right'
                                : 'animate-in fade-in slide-in-from-right duration-300'
                        }`}>
                            <div className="rounded-lg bg-blue-50 p-4 transition-all hover:scale-102 dark:bg-blue-900/20 animate-in fade-in slide-in-from-bottom-2">
                                <p className="text-sm text-blue-800 dark:text-blue-400">
                                    <strong>Type:</strong> {getSelectedTypeInfo()?.label} - {getSelectedTypeInfo()?.details}
                                </p>
                            </div>

                            {formData.type !== 'text' && (
                                <>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '100ms' }}>
                                            <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-white">
                                                Maximum Selections
                                            </label>
                                            <input
                                                type="number"
                                                name="max_selections"
                                                value={formData.max_selections}
                                                onChange={handleInputChange}
                                                min="1"
                                                max={formData.type === 'rating' ? '10' : '50'}
                                                className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 transition-all focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                {formData.type === 'rating'
                                                    ? 'Maximum rating value (e.g., 5 for 1-5 scale)'
                                                    : formData.type === 'ranked_choice'
                                                        ? 'Number of rankings to collect'
                                                        : 'Maximum number of options voters can select'
                                                }
                                            </p>
                                        </div>

                                        {(formData.type === 'multiple_choice' || formData.type === 'ranked_choice') && (
                                            <div className="animate-in fade-in slide-in-from-right-2 duration-300" style={{ animationDelay: '150ms' }}>
                                                <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-white">
                                                    Minimum Selections
                                                </label>
                                                <input
                                                    type="number"
                                                    name="min_selections"
                                                    value={formData.min_selections}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    max={formData.max_selections}
                                                    className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 transition-all focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {formData.type === 'ranked_choice'
                                                        ? 'Minimum number of rankings required'
                                                        : 'Minimum number of options voters must select'
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '200ms' }}>
                                <input
                                    type="checkbox"
                                    name="randomize_options"
                                    checked={formData.randomize_options}
                                    onChange={handleInputChange}
                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 transition-all focus:ring-red-600"
                                />
                                <div>
                                    <label className="text-sm font-medium text-[#1b1b18] dark:text-white">
                                        Randomize options?
                                    </label>
                                    <p className="text-xs text-gray-500">
                                        Randomly sorts the list of options on the ballot for each voter
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Confirmation */}
                    {step === 4 && (
                        <div className={`space-y-4 transition-all duration-300 ${
                            animating
                                ? direction === 'forward'
                                    ? 'animate-out fade-out slide-out-to-left'
                                    : 'animate-out fade-out slide-out-to-right'
                                : 'animate-in fade-in slide-in-from-right duration-300'
                        }`}>
                            <h3 className="font-medium text-[#1b1b18] dark:text-white animate-in fade-in slide-in-from-bottom-2">
                                Confirm Ballot Details
                            </h3>

                            <div className="rounded-lg border border-[#e3e3e0] bg-gray-50 p-4 transition-all hover:scale-102 dark:border-[#3E3E3A] dark:bg-gray-900/20 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: '100ms' }}>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs font-medium uppercase text-gray-500">Type</span>
                                        <p className="text-sm font-medium text-[#1b1b18] dark:text-white">
                                            {getSelectedTypeInfo()?.label}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {getSelectedTypeInfo()?.details}
                                        </p>
                                    </div>

                                    <div className="h-px bg-gray-200 dark:bg-gray-700" />

                                    <div>
                                        <span className="text-xs font-medium uppercase text-gray-500">Title</span>
                                        <p className="text-sm font-medium text-[#1b1b18] dark:text-white">
                                            {formData.title}
                                        </p>
                                    </div>

                                    {formData.description && (
                                        <>
                                            <div className="h-px bg-gray-200 dark:bg-gray-700" />
                                            <div>
                                                <span className="text-xs font-medium uppercase text-gray-500">Description</span>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {formData.description}
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    {formData.type !== 'text' && (
                                        <>
                                            <div className="h-px bg-gray-200 dark:bg-gray-700" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-xs font-medium uppercase text-gray-500">Max Selections</span>
                                                    <p className="text-sm font-medium text-[#1b1b18] dark:text-white">
                                                        {formData.max_selections}
                                                    </p>
                                                </div>
                                                {(formData.type === 'multiple_choice' || formData.type === 'ranked_choice') && (
                                                    <div>
                                                        <span className="text-xs font-medium uppercase text-gray-500">Min Selections</span>
                                                        <p className="text-sm font-medium text-[#1b1b18] dark:text-white">
                                                            {formData.min_selections}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    <div className="h-px bg-gray-200 dark:bg-gray-700" />

                                    <div>
                                        <span className="text-xs font-medium uppercase text-gray-500">Randomize Options</span>
                                        <p className="text-sm font-medium text-[#1b1b18] dark:text-white">
                                            {formData.randomize_options ? 'Yes' : 'No'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-yellow-50 p-3 transition-all hover:scale-102 dark:bg-yellow-900/20 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: '200ms' }}>
                                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                                    ⚠️ Please review the details above before creating the ballot.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex justify-between gap-3 border-t border-[#e3e3e0] bg-white px-6 py-4 transition-all dark:border-[#3E3E3A] dark:bg-[#161615]">
                    {step > 1 ? (
                        <button
                            onClick={handleBack}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:scale-105 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:bg-red-700"
                        >
                            Next
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4" />
                                    Create Ballot
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}