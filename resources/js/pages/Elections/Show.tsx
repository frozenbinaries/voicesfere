import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    ArrowLeft,
    Calendar,
    Users,
    FileText,
    UserCheck,
    Eye,
    Rocket,
    BarChart3,
    Settings,
    Copy,
    CheckCircle,
    Clock,
    AlertCircle,
    Trash2,
    Plus,
    Download,
    Upload,
    X,
    User,
    Mail,
    Image as ImageIcon,
    Globe,
    EyeOff,
    Eye as EyeIcon,
    IdCard,
    Info,
    ChevronRight,
    ChevronLeft,
    ExternalLink,
    CreditCard,
    DollarSign,
    Shield,
    Crown,
    Lock,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import CreateBallotModal from '@/components/CreateBallotModal';
import OptionModal from '@/components/OptionModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface Option {
    id: number;
    title: string;
    description: string | null;
    should_display_a_photo: boolean;
    photo_url: string | null;
    display_order: number;
}

interface Ballot {
    id: number;
    title: string;
    description: string | null;
    type:
        | 'single_choice'
        | 'multiple_choice'
        | 'ranked_choice'
        | 'rating'
        | 'text';
    max_selections: number;
    min_selections: number;
    randomize_options: boolean;
    display_order: number;
    options?: Option[];
}

interface Voter {
    id: number;
    name: string;
    email: string | null;
    voter_id: string | null;
    voter_token: string;
    has_voted?: boolean;
    invited_at?: string | null;
    voted_at?: string | null;
}

interface Subscription {
    id: number;
    plan_id: number;
    status: 'active' | 'expired' | 'cancelled';
    starts_at: string;
    ends_at: string;
    plan?: Plan;
}

interface Plan {
    id: number;
    name: string;
    price: string;
    currency: string;
    min_voters: number;
    max_voters: number;
    description: string;
    status: string;
}

interface Election {
    id: number;
    title: string;
    description: string | null;
    status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
    start_date: string | null;
    end_date: string | null;
    identifier: string;
    created_by: number;
    created_at: string;
    updated_at: string;
    timezone?: string;
    leaderboard_on?: boolean;
    ballots?: Ballot[];
    voters?: Voter[];
    votes_count?: number;
    subscription?: Subscription | null;
}

interface Props {
    election: Election;
    plans: Plan[];
}

const formatPrice = (price: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(parseFloat(price));
};

// ─── Confirmation Modal for Subscription ─────────────────────────────────────
function SubscribeConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    plan,
    electionId,
    isLoading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    plan: Plan | null;
    electionId: number;
    isLoading: boolean;
}) {
    if (!isOpen || !plan) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative z-10 max-w-md w-full animate-in rounded-2xl bg-white shadow-2xl duration-200 fade-in zoom-in dark:bg-[#161615]">
                <div className="flex items-center justify-between border-b border-[#e3e3e0] p-6 dark:border-[#3E3E3A]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-white">
                                Confirm Subscription
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                You're about to subscribe to {plan.name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Plan</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{plan.name}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Price</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {formatPrice(plan.price, plan.currency)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Voters</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {plan.min_voters.toLocaleString()} - {plan.max_voters.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        You will be redirected to the checkout page to complete your payment.
                        Your election will be activated immediately after successful payment.
                    </p>
                </div>

                <div className="flex justify-end gap-3 border-t border-[#e3e3e0] p-6 dark:border-[#3E3E3A]">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-[#3E3E3A] dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="h-4 w-4" />
                                Continue to Checkout
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Ballot type colors for headers
const ballotTypeColors: Record<
    string,
    { bg: string; border: string; text: string }
> = {
    single_choice: {
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-700 dark:text-blue-400',
    },
    multiple_choice: {
        bg: 'bg-green-50 dark:bg-green-950/30',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-700 dark:text-green-400',
    },
    ranked_choice: {
        bg: 'bg-purple-50 dark:bg-purple-950/30',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-700 dark:text-purple-400',
    },
    rating: {
        bg: 'bg-yellow-50 dark:bg-yellow-950/30',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-700 dark:text-yellow-400',
    },
    text: {
        bg: 'bg-gray-50 dark:bg-gray-800',
        border: 'border-gray-200 dark:border-gray-700',
        text: 'text-gray-700 dark:text-gray-400',
    },
};

// Helper function to get help link
const getHelpLink = (anchorId: string) => {
    return `/help#${anchorId}`;
};

// ─── Leaderboard Settings Modal ──────────────────────────────────────────────
function LeaderboardSettingsModal({
    isOpen,
    onClose,
    election,
}: {
    isOpen: boolean;
    onClose: () => void;
    election: Election;
}) {
    const [leaderboardOn, setLeaderboardOn] = useState(
        election.leaderboard_on ?? true,
    );
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const getLeaderboardMessage = () => {
        if (election.status === 'active') {
            return 'When enabled, voters will be able to see live results as votes are cast.';
        }
        if (election.status === 'completed') {
            return 'When enabled, people will be able to see the final results of this election.';
        }
        return 'When enabled, people will immediately start seeing results once the voting has started.';
    };

    const handleSave = () => {
        setSaving(true);
        router.put(
            `/elections/${election.id}/leaderboard`,
            {
                leaderboard_on: leaderboardOn,
            },
            {
                onSuccess: () => {
                    setSaving(false);
                    onClose();
                    router.reload();
                },
                onError: () => {
                    setSaving(false);
                },
            },
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md animate-in rounded-xl bg-white shadow-xl duration-200 fade-in zoom-in dark:bg-[#161615]">
                <div className="flex items-center justify-between border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                    <div>
                        <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-white">
                            Leaderboard Settings
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Control who can see election results
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4 p-6">
                    <div className="flex items-center justify-between rounded-lg border border-[#e3e3e0] p-4 dark:border-[#3E3E3A]">
                        <div className="flex items-center gap-3">
                            {leaderboardOn ? (
                                <Globe className="h-5 w-5 text-green-600" />
                            ) : (
                                <EyeOff className="h-5 w-5 text-red-600" />
                            )}
                            <div>
                                <p className="font-medium text-[#1b1b18] dark:text-white">
                                    Public Leaderboard
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {getLeaderboardMessage()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setLeaderboardOn(!leaderboardOn)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                                leaderboardOn
                                    ? 'bg-red-600'
                                    : 'bg-gray-300 dark:bg-gray-700'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
                                    leaderboardOn
                                        ? 'translate-x-6'
                                        : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                        <div className="flex items-start gap-2">
                            <EyeIcon className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <div className="text-xs text-blue-800 dark:text-blue-300">
                                {leaderboardOn ? (
                                    <>
                                        <p className="font-medium">
                                            Leaderboard is visible
                                        </p>
                                        <p className="mt-1">
                                            {election.status === 'active'
                                                ? 'Voters can see live results in real-time.'
                                                : election.status ===
                                                    'completed'
                                                  ? 'Final results are publicly visible.'
                                                  : 'Results will appear once voting begins.'}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-medium">
                                            Leaderboard is hidden
                                        </p>
                                        <p className="mt-1">
                                            No one can see the results. You can
                                            enable this at any time.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-[#3E3E3A] dark:text-gray-300 dark:hover:bg-gray-800"
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
                            <CheckCircle className="h-4 w-4" />
                        )}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Add Voter Modal ──────────────────────────────────────────────────────────
function AddVoterModal({
    isOpen,
    onClose,
    electionId,
    isEditable,
}: {
    isOpen: boolean;
    onClose: () => void;
    electionId: number;
    isEditable: boolean;
}) {
    const [name, setName] = useState('');
    const [voterId, setVoterId] = useState('');
    const [email, setEmail] = useState('');
    const [saving, setSaving] = useState(false);
    const [importing, setImporting] = useState(false);
    const [errors, setErrors] = useState<{
        name?: string;
        voter_id?: string;
        email?: string;
    }>({});
    const fileRef = useRef<HTMLInputElement | null>(null);

    if (!isOpen) return null;

    const handleAddSingle = () => {
        if (!isEditable) {
            setErrors({ email: 'Cannot add voters to a completed or active election.' });
            return;
        }

        const newErrors: { name?: string; voter_id?: string; email?: string } =
            {};

        if (!name.trim()) {
            newErrors.name = 'Name is required';
        }

        const hasEmail = email.trim().length > 0;
        const hasVoterId = voterId.trim().length > 0;

        if (!hasEmail && !hasVoterId) {
            newErrors.email = 'Either Email or Voter ID is required';
            newErrors.voter_id = 'Either Email or Voter ID is required';
        }

        if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setSaving(true);

        router.post(
            `/elections/${electionId}/voters`,
            {
                name: name.trim(),
                voter_id: voterId.trim() || null,
                email: email.trim() || null,
            },
            {
                onSuccess: () => {
                    setSaving(false);
                    setName('');
                    setVoterId('');
                    setEmail('');
                    setErrors({});
                    onClose();
                    router.reload();
                },
                onError: (errorResponse) => {
                    setSaving(false);
                    if (errorResponse.email) {
                        setErrors({ email: errorResponse.email });
                    } else if (errorResponse.voter_id) {
                        setErrors({ voter_id: errorResponse.voter_id });
                    } else {
                        setErrors({
                            email: 'Failed to add voter. Please try again.',
                        });
                    }
                },
            },
        );
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isEditable) {
            setErrors({ email: 'Cannot import voters to a completed or active election.' });
            return;
        }

        const file = e.target.files?.[0];
        if (!file) return;
        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);
        router.post(`/elections/${electionId}/voters/import`, formData, {
            forceFormData: true,
            onSuccess: () => {
                setImporting(false);
                onClose();
                router.reload();
            },
            onError: () => {
                setImporting(false);
            },
        });
    };

    const downloadTemplate = () => {
        const csv =
            'name,voter_id,email\nJane Doe,JANE001,jane@example.com\nJohn Smith,JOHN001,john@example.com\nBob Wilson,,bob@example.com\nAlice Brown,ALICE001,\n';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'voters_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md animate-in rounded-xl bg-white shadow-xl duration-200 fade-in zoom-in dark:bg-[#161615]">
                <div className="flex items-center justify-between border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                    <div>
                        <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-white">
                            Add Voter
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isEditable ? 'Add individually or import a CSV file' : 'Voting is locked for this election'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4 p-6">
                    {!isEditable && (
                        <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                            <div className="flex items-start gap-2">
                                <Lock className="mt-0.5 h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                <div className="text-xs text-yellow-800 dark:text-yellow-300">
                                    <p className="font-medium">Read-Only Mode</p>
                                    <p className="mt-1">
                                        This election is {election.status}. You cannot add or modify voters.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="relative">
                            <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Full name *"
                                disabled={!isEditable}
                                className={`w-full rounded-lg border ${
                                    errors.name
                                        ? 'border-red-500'
                                        : 'border-[#e3e3e0]'
                                } py-2 pr-3 pl-9 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="relative">
                            <IdCard className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={voterId}
                                onChange={(e) => setVoterId(e.target.value)}
                                placeholder="Voter ID (required if no email)"
                                disabled={!isEditable}
                                className={`w-full rounded-lg border ${
                                    errors.voter_id
                                        ? 'border-red-500'
                                        : 'border-[#e3e3e0]'
                                } py-2 pr-3 pl-9 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                            />
                            {errors.voter_id && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.voter_id}
                                </p>
                            )}
                        </div>

                        <div className="relative">
                            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address (required if no Voter ID)"
                                disabled={!isEditable}
                                className={`w-full rounded-lg border ${
                                    errors.email
                                        ? 'border-red-500'
                                        : 'border-[#e3e3e0]'
                                } py-2 pr-3 pl-9 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleAddSingle()
                                }
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleAddSingle}
                            disabled={saving || !name.trim() || !isEditable}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                            Add Voter
                        </button>
                    </div>

                    <div className="relative flex items-center gap-3">
                        <div className="h-px flex-1 bg-[#e3e3e0] dark:bg-[#3E3E3A]" />
                        <span className="text-xs text-gray-400 dark:text-gray-600">
                            or import from file
                        </span>
                        <div className="h-px flex-1 bg-[#e3e3e0] dark:bg-[#3E3E3A]" />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={downloadTemplate}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-[#3E3E3A] dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            <Download className="h-4 w-4" />
                            Download Template
                        </button>
                        <button
                            onClick={() => fileRef.current?.click()}
                            disabled={importing || !isEditable}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-[#3E3E3A] dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            {importing ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                            ) : (
                                <Upload className="h-4 w-4" />
                            )}
                            Import CSV
                        </button>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".csv"
                            className="sr-only"
                            onChange={handleImport}
                        />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-600">
                        CSV must have <code className="font-mono">name</code>,{' '}
                        <code className="font-mono">voter_id</code> (optional),
                        and <code className="font-mono">email</code> (optional)
                        columns.
                        <br />
                        <span className="text-yellow-600 dark:text-yellow-500">
                            Note:
                        </span>{' '}
                        Either <strong>voter_id</strong> or{' '}
                        <strong>email</strong> must be provided for each row.
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── Delete Confirmation Modal ───────────────────────────────────
function CustomDeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    title,
    message,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    title: string;
    message: string;
}) {
    const [confirmText, setConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setConfirmText('');
        }
    }, [isOpen, itemName]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (confirmText !== itemName) return;
        setDeleting(true);
        await onConfirm();
        setDeleting(false);
        onClose();
        setConfirmText('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md animate-in rounded-xl bg-white shadow-xl duration-200 fade-in zoom-in dark:bg-[#161615]">
                <div className="flex items-center justify-between border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-white">
                                {title}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                This action cannot be undone
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        {message}
                    </p>
                    <div className="mt-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Type{' '}
                            <span className="font-bold text-red-600">
                                {itemName}
                            </span>{' '}
                            to confirm:
                        </p>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                            placeholder={`Type "${itemName}" to confirm`}
                            autoFocus
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-[#3E3E3A] dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={confirmText !== itemName || deleting}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
                        >
                            {deleting ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Multi-Step Launch Confirmation Modal ────────────────────────────────────
function LaunchConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    election,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    election: Election;
}) {
    const [step, setStep] = useState(1);
    const [isChecked, setIsChecked] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);

    if (!isOpen) return null;

    const hasBallots = election.ballots && election.ballots.length > 0;
    const hasOptions = election.ballots?.some(
        (ballot) => ballot.options && ballot.options.length > 0,
    );
    const hasVoters = election.voters && election.voters.length > 0;
    const startDate = election.start_date
        ? new Date(election.start_date)
        : null;
    const now = new Date();
    const isStartDateInFuture = startDate && startDate > now;
    const hasDefaultOptions = election.ballots?.some((ballot) =>
        ballot.options?.some((option) => option.title === 'New Option'),
    );
    const hasEmptyOptions = election.ballots?.some(
        (ballot) => ballot.options?.length === 0,
    );

    const canLaunch = hasBallots && hasOptions && hasVoters && !hasEmptyOptions;

    const getWarnings = () => {
        const warnings = [];
        if (!hasBallots)
            warnings.push({
                type: 'error',
                message: 'No ballots added to this election',
                anchor: 'no-ballots',
            });
        if (hasBallots && !hasOptions)
            warnings.push({
                type: 'error',
                message: 'Some ballots have no options',
                anchor: 'ballots-no-options',
            });
        if (hasBallots && hasEmptyOptions)
            warnings.push({
                type: 'error',
                message: 'Some ballots have empty options',
                anchor: 'empty-ballot-options',
            });
        if (!hasVoters)
            warnings.push({
                type: 'error',
                message: 'No voters added to this election',
                anchor: 'no-voters',
            });
        if (hasDefaultOptions)
            warnings.push({
                type: 'warning',
                message:
                    'Some options have the default title "New Option". Consider renaming them.',
                anchor: 'default-option-names',
            });
        if (isStartDateInFuture)
            warnings.push({
                type: 'info',
                message:
                    'Start date is in the future. The election will start automatically on the specified date.',
                anchor: 'future-start-date',
            });
        return warnings;
    };

    const warnings = getWarnings();
    const hasErrors = warnings.some((w) => w.type === 'error');
    const errorCount = warnings.filter((w) => w.type === 'error').length;
    const warningCount = warnings.filter((w) => w.type === 'warning').length;
    const infoCount = warnings.filter((w) => w.type === 'info').length;

    const handleNext = () => {
        if (step === 1 && hasErrors) return;
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleConfirm = () => {
        if (!isChecked || hasErrors) return;
        setIsLaunching(true);
        onConfirm();
    };

    const resetModal = () => {
        setStep(1);
        setIsChecked(false);
        setIsLaunching(false);
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />
            <div className="relative z-10 max-h-[90vh] w-full max-w-2xl animate-in overflow-y-auto rounded-2xl bg-white shadow-2xl duration-200 fade-in zoom-in dark:bg-[#161615]">
                <div className="sticky top-0 z-10 border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                <Rocket className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-white">
                                    Launch Election
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Step {step} of 3
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        {[
                            {
                                step: 1,
                                label: 'Review Issues',
                                icon: AlertCircle,
                            },
                            { step: 2, label: 'Settings', icon: Settings },
                            { step: 3, label: 'Confirm', icon: CheckCircle },
                        ].map((s) => {
                            const Icon = s.icon;
                            const isActive = step === s.step;
                            const isCompleted = step > s.step;
                            return (
                                <div
                                    key={s.step}
                                    className="flex flex-1 items-center"
                                >
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all ${
                                                isActive
                                                    ? 'scale-110 bg-red-600 text-white'
                                                    : isCompleted
                                                      ? 'bg-green-600 text-white'
                                                      : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle className="h-4 w-4" />
                                            ) : (
                                                s.step
                                            )}
                                        </div>
                                        <span
                                            className={`mt-1 text-xs ${isActive ? 'font-medium text-red-600' : 'text-gray-500'}`}
                                        >
                                            {s.label}
                                        </span>
                                    </div>
                                    {s.step < 3 && (
                                        <div
                                            className={`mx-2 h-px flex-1 ${step > s.step ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {step === 1 && (
                    <div className="space-y-6 p-6">
                        <div className="rounded-lg border border-[#e3e3e0] bg-gray-50 p-4 dark:border-[#3E3E3A] dark:bg-gray-900/20">
                            <div className="mb-3 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <h3 className="font-semibold text-[#1b1b18] dark:text-white">
                                    Election Assistant
                                </h3>
                            </div>
                            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                                This scan resulted in{' '}
                                <strong className="text-red-600">
                                    {warnings.length}
                                </strong>{' '}
                                item(s) that need attention:
                            </p>
                            <div className="space-y-2">
                                {warnings.map((warning, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-start justify-between rounded-lg p-2 text-sm ${
                                            warning.type === 'error'
                                                ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                : warning.type === 'warning'
                                                  ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                  : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            {warning.type === 'error' && (
                                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                            )}
                                            {warning.type === 'warning' && (
                                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                            )}
                                            {warning.type === 'info' && (
                                                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                                            )}
                                            <span>{warning.message}</span>
                                        </div>
                                        {warning.anchor && (
                                            <a
                                                href={getHelpLink(
                                                    warning.anchor,
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ml-4 inline-flex items-center gap-1 text-xs whitespace-nowrap text-red-600 hover:underline"
                                            >
                                                Learn How to Fix
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-lg border border-[#e3e3e0] p-3 text-center dark:border-[#3E3E3A]">
                                <div className="text-2xl font-bold text-red-600">
                                    {errorCount}
                                </div>
                                <p className="text-xs text-gray-500">Errors</p>
                            </div>
                            <div className="rounded-lg border border-[#e3e3e0] p-3 text-center dark:border-[#3E3E3A]">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {warningCount}
                                </div>
                                <p className="text-xs text-gray-500">
                                    Warnings
                                </p>
                            </div>
                            <div className="rounded-lg border border-[#e3e3e0] p-3 text-center dark:border-[#3E3E3A]">
                                <div className="text-2xl font-bold text-blue-600">
                                    {infoCount}
                                </div>
                                <p className="text-xs text-gray-500">Info</p>
                            </div>
                        </div>

                        {hasErrors && (
                            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                                <p className="text-sm text-red-700 dark:text-red-400">
                                    ⚠️ Please resolve all errors before
                                    proceeding.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 p-6">
                        <div className="rounded-lg border border-[#e3e3e0] dark:border-[#3E3E3A]">
                            <div className="flex items-center gap-2 border-b border-[#e3e3e0] px-4 py-3 dark:border-[#3E3E3A]">
                                <Settings className="h-4 w-4 text-gray-500" />
                                <h3 className="font-medium text-[#1b1b18] dark:text-white">
                                    Election Settings
                                </h3>
                            </div>
                            <div className="space-y-3 p-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Start Date:
                                    </span>
                                    <span className="font-medium">
                                        {election.start_date
                                            ? new Date(
                                                  election.start_date,
                                              ).toLocaleString()
                                            : 'Not set'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        End Date:
                                    </span>
                                    <span className="font-medium">
                                        {election.end_date
                                            ? new Date(
                                                  election.end_date,
                                              ).toLocaleString()
                                            : 'Not set'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Leaderboard:
                                    </span>
                                    <span
                                        className={`font-medium ${election.leaderboard_on ? 'text-green-600' : 'text-red-600'}`}
                                    >
                                        {election.leaderboard_on
                                            ? 'Public'
                                            : 'Hidden'}
                                    </span>
                                </div>
                                {isStartDateInFuture && (
                                    <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-2 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                                        <Info className="mt-0.5 h-4 w-4 shrink-0" />
                                        <span>
                                            The election will start
                                            automatically on the specified date.
                                        </span>
                                        <a
                                            href={getHelpLink(
                                                'future-start-date',
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-auto text-xs text-red-600 hover:underline"
                                        >
                                            Learn More
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg border border-[#e3e3e0] dark:border-[#3E3E3A]">
                            <div className="flex items-center gap-2 border-b border-[#e3e3e0] px-4 py-3 dark:border-[#3E3E3A]">
                                <Users className="h-4 w-4 text-gray-500" />
                                <h3 className="font-medium text-[#1b1b18] dark:text-white">
                                    Voters
                                </h3>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-2">
                                    {hasVoters ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <span className="text-sm">
                                        {election.voters?.length || 0} voter(s)
                                        added to this election
                                    </span>
                                    {!hasVoters && (
                                        <a
                                            href={getHelpLink('no-voters')}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-auto text-xs text-red-600 hover:underline"
                                        >
                                            Learn How to Fix →
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-[#e3e3e0] dark:border-[#3E3E3A]">
                            <div className="flex items-center gap-2 border-b border-[#e3e3e0] px-4 py-3 dark:border-[#3E3E3A]">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <h3 className="font-medium text-[#1b1b18] dark:text-white">
                                    Ballots
                                </h3>
                            </div>
                            <div className="space-y-2 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {hasBallots ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                        )}
                                        <span className="text-sm">
                                            {election.ballots?.length || 0}{' '}
                                            ballot(s) added
                                        </span>
                                    </div>
                                    {!hasBallots && (
                                        <a
                                            href={getHelpLink('no-ballots')}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-red-600 hover:underline"
                                        >
                                            Learn How to Fix →
                                        </a>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {hasOptions ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                        )}
                                        <span className="text-sm">
                                            All ballots have options
                                        </span>
                                    </div>
                                    {!hasOptions && (
                                        <a
                                            href={getHelpLink(
                                                'ballots-no-options',
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-red-600 hover:underline"
                                        >
                                            Learn How to Fix →
                                        </a>
                                    )}
                                </div>
                                {hasDefaultOptions && (
                                    <div className="flex items-center justify-between border-t border-[#e3e3e0] pt-2 dark:border-[#3E3E3A]">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                                            <span className="text-sm">
                                                Default option names detected
                                            </span>
                                        </div>
                                        <a
                                            href={getHelpLink(
                                                'default-option-names',
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-red-600 hover:underline"
                                        >
                                            Learn How to Fix →
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 p-6">
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-800 dark:text-green-400">
                                        Ready to Launch!
                                    </p>
                                    <p className="mt-1 text-sm text-green-700 dark:text-green-500">
                                        Once launched, voters will be able to
                                        access the election and cast their
                                        votes. This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-[#e3e3e0] dark:border-[#3E3E3A]">
                            <div className="flex items-center gap-3 p-4">
                                <input
                                    type="checkbox"
                                    id="confirmLaunch"
                                    checked={isChecked}
                                    onChange={(e) =>
                                        setIsChecked(e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600"
                                />
                                <label
                                    htmlFor="confirmLaunch"
                                    className="text-sm text-gray-700 dark:text-gray-300"
                                >
                                    I confirm that I have reviewed all settings
                                    and want to launch this election.
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                <div className="sticky bottom-0 flex justify-between gap-3 border-t border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    {step > 1 ? (
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-[#3E3E3A] dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            disabled={step === 1 && hasErrors}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleConfirm}
                            disabled={!isChecked || hasErrors || isLaunching}
                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-700 disabled:opacity-50"
                        >
                            {isLaunching ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Launching...
                                </>
                            ) : (
                                <>
                                    <Rocket className="h-4 w-4" />
                                    Launch Election
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ElectionShow({ election, plans }: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const [copied, setCopied] = useState(false);
    const [isBallotModalOpen, setIsBallotModalOpen] = useState(false);
    const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddVoterModalOpen, setIsAddVoterModalOpen] = useState(false);
    const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
    const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedBallot, setSelectedBallot] = useState<Ballot | null>(null);
    const [ballotToDelete, setBallotToDelete] = useState<Ballot | null>(null);
    const [optionToDelete, setOptionToDelete] = useState<{
        option: Option;
        ballot: Ballot;
    } | null>(null);
    const [voterToDelete, setVoterToDelete] = useState<Voter | null>(null);
    const [deleteModalConfig, setDeleteModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        itemName: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        itemName: '',
        onConfirm: () => {},
    });

    const voterCount = election.voters?.length || 0;
    const isEditable = election.status === 'draft';
    const isActive = election.status === 'active';
    const isCompleted = election.status === 'completed' || election.status === 'archived';

    const currentPlan = election.subscription?.plan || null;
    const hasValidSubscription =
        election.subscription?.status === 'active' &&
        new Date(election.subscription.ends_at) > new Date();

    // Find recommended plan based on voter count
    const recommendedPlan = plans.find(
        (plan) =>
            plan.max_voters >= voterCount && plan.min_voters <= voterCount,
    );

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Eye, count: null },
        {
            id: 'ballots',
            label: 'Ballots',
            icon: FileText,
            count: election.ballots?.length || 0,
        },
        {
            id: 'voters',
            label: 'Voters',
            icon: Users,
            count: election.voters?.length || 0,
        },
        { id: 'preview', label: 'Preview', icon: UserCheck, count: null },
        { id: 'launch', label: 'Launch', icon: Rocket, count: null },
    ];

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleManageOptions = (ballot: Ballot) => {
        if (!isEditable) {
            alert('This election is not in draft mode. You cannot modify ballots.');
            return;
        }
        setSelectedBallot(ballot);
        setIsOptionModalOpen(true);
    };

    const handleDeleteBallotClick = (ballot: Ballot) => {
        if (!isEditable) {
            alert('This election is not in draft mode. You cannot delete ballots.');
            return;
        }
        setDeleteModalConfig({
            isOpen: true,
            title: 'Delete Ballot Question',
            message:
                'This action cannot be undone. This will permanently delete the ballot question and all its options.',
            itemName: ballot.title,
            onConfirm: () => {
                router.delete(`/ballots/${ballot.id}`);
                setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }));
                setBallotToDelete(null);
            },
        });
        setBallotToDelete(ballot);
        setOptionToDelete(null);
        setVoterToDelete(null);
    };

    const handleDeleteOptionClick = (option: Option, ballot: Ballot) => {
        if (!isEditable) {
            alert('This election is not in draft mode. You cannot delete options.');
            return;
        }
        setDeleteModalConfig({
            isOpen: true,
            title: 'Remove Option',
            message:
                'This will permanently remove this option from the ballot. Voters will no longer see it.',
            itemName: option.title,
            onConfirm: () => {
                router.delete(`/options/${option.id}`);
                setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }));
                setOptionToDelete(null);
            },
        });
        setOptionToDelete({ option, ballot });
        setBallotToDelete(null);
        setVoterToDelete(null);
    };

    const handleDeleteVoterClick = (voter: Voter) => {
        if (!isEditable) {
            alert('This election is not in draft mode. You cannot remove voters.');
            return;
        }
        setDeleteModalConfig({
            isOpen: true,
            title: 'Remove Voter',
            message:
                'This will permanently remove this voter from the election. They will no longer be able to vote.',
            itemName: voter.name,
            onConfirm: () => {
                router.delete(`/voters/${voter.id}`);
                setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }));
                setVoterToDelete(null);
            },
        });
        setVoterToDelete(voter);
        setBallotToDelete(null);
        setOptionToDelete(null);
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }));
        setBallotToDelete(null);
        setOptionToDelete(null);
        setVoterToDelete(null);
    };

    // ─── Handle Subscription/Checkout ──────────────────────────────────────────
    const handleSubscribeClick = (plan: Plan) => {
        setSelectedPlan(plan);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmSubscription = () => {
        if (!selectedPlan) return;

        setIsLoading(true);

        // Redirect to checkout with the election ID and plan ID
        router.get(`/checkout/${election.id}`, {
            plan_id: selectedPlan.id,
            election_id: election.id,
        }, {
            onFinish: () => {
                setIsLoading(false);
                setIsConfirmModalOpen(false);
            },
            onError: () => {
                setIsLoading(false);
                alert('Failed to proceed to checkout. Please try again.');
            }
        });
    };

    const handleLaunch = () => {
        router.post(
            `/elections/${election.id}/launch`,
            {},
            {
                onSuccess: () => {
                    setIsLaunchModalOpen(false);
                    router.reload();
                },
            },
        );
    };

    const electionUrl = `${window.location.origin}/vote/${election.identifier}`;
    const leaderboardUrl = `${window.location.origin}/leaderboard/${election.identifier}`;
    const previewUrl = `/vote/${election.identifier}/preview`;

    const getStatusConfig = () => {
        const now = new Date();
        const startDate = election.start_date
            ? new Date(election.start_date)
            : null;
        const endDate = election.end_date ? new Date(election.end_date) : null;

        if (election.status === 'draft') {
            return {
                label: 'Draft',
                color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                icon: Clock,
            };
        }
        if (election.status === 'active') {
            if (startDate && now < startDate) {
                return {
                    label: 'Upcoming',
                    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                    icon: Clock,
                };
            }
            if (endDate && now > endDate) {
                return {
                    label: 'Completed',
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                    icon: CheckCircle,
                };
            }
            return {
                label: 'Active',
                color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                icon: CheckCircle,
            };
        }
        if (election.status === 'completed') {
            return {
                label: 'Completed',
                color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                icon: CheckCircle,
            };
        }
        if (election.status === 'paused') {
            return {
                label: 'Paused',
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                icon: AlertCircle,
            };
        }
        return {
            label: 'Archived',
            color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            icon: AlertCircle,
        };
    };

    const getBallotTypeLabel = (type: string) => {
        switch (type) {
            case 'single_choice':
                return 'Single Choice';
            case 'multiple_choice':
                return 'Multiple Choice';
            case 'ranked_choice':
                return 'Ranked Choice';
            case 'rating':
                return 'Rating Scale';
            case 'text':
                return 'Text Response';
            default:
                return type;
        }
    };

    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon;
    const totalCandidates =
        election.ballots?.reduce(
            (total, ballot) => total + (ballot.options?.length || 0),
            0,
        ) || 0;

    return (
        <AdminLayout title={election.title}>
            <Head title={`${election.title} - VoiceSphere`} />

            <div className="space-y-6">
                {/* Back */}
                <div className="flex items-center justify-between gap-4">
                    <Link
                        href="/elections"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-500"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Elections
                    </Link>

                    {/* Preview Button - Always Visible */}
                    <Link
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
                    >
                        <Eye className="h-4 w-4" />
                        Preview Election
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                </div>

                {/* Title + status + leaderboard settings */}
                <div className="rounded-xl border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-[#1b1b18] dark:text-white">
                                {election.title}
                            </h1>
                            {election.description && (
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {election.description}
                                </p>
                            )}
                            {!isEditable && (
                                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                    <Lock className="h-3 w-3" />
                                    Read-Only Mode - This election is {election.status}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${statusConfig.color}`}
                            >
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                            </div>
                            <button
                                onClick={() => setIsLeaderboardModalOpen(true)}
                                className="inline-flex items-center gap-2 rounded-full border border-[#e3e3e0] px-3 py-1 text-sm font-medium transition-all hover:bg-gray-100 dark:border-[#3E3E3A] dark:hover:bg-gray-800"
                                title="Leaderboard Settings"
                            >
                                {election.leaderboard_on ? (
                                    <Globe className="h-3 w-3 text-green-600" />
                                ) : (
                                    <EyeOff className="h-3 w-3 text-red-600" />
                                )}
                                <span className="text-xs">
                                    {election.leaderboard_on
                                        ? 'Public'
                                        : 'Hidden'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Current Plan Badge with Subscribe Button */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/20">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {currentPlan ? (
                                <>
                                    {hasValidSubscription ? (
                                        <Shield className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Current Plan
                                        </p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {currentPlan.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatPrice(
                                                currentPlan.price,
                                                currentPlan.currency,
                                            )}{' '}
                                            • {currentPlan.min_voters}-
                                            {currentPlan.max_voters} voters
                                        </p>
                                        {hasValidSubscription &&
                                            election.subscription && (
                                                <p className="text-xs text-green-600">
                                                    Active until{' '}
                                                    {new Date(
                                                        election.subscription
                                                            .ends_at,
                                                    ).toLocaleDateString()}
                                                </p>
                                            )}
                                        {!hasValidSubscription &&
                                            election.subscription && (
                                                <p className="text-xs text-red-500">
                                                    Expired
                                                </p>
                                            )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Crown className="h-5 w-5 text-yellow-600" />
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Current Plan
                                        </p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            FREE
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Up to 20 voters • No payment
                                            required
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                // If no valid subscription, show the plan selector
                                if (!hasValidSubscription) {
                                    // Find the right plan based on voter count
                                    const planToSelect = recommendedPlan || plans.find(p => p.status === 'active');
                                    if (planToSelect) {
                                        handleSubscribeClick(planToSelect);
                                    } else {
                                        alert('No subscription plans available.');
                                    }
                                } else {
                                    alert('You already have an active subscription.');
                                }
                            }}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
                        >
                            <CreditCard className="h-4 w-4" />
                            {hasValidSubscription ? 'Active' : currentPlan ? 'Renew Plan' : 'Subscribe'}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                    <nav className="flex gap-1 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                                        isActive
                                            ? 'border-b-2 border-red-600 text-red-600'
                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                    {tab.count !== null && (
                                        <span
                                            className={`ml-1 rounded-full px-1.5 py-0.5 text-xs ${
                                                isActive
                                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                                    : tab.count > 0
                                                      ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                      : 'bg-gray-50 text-gray-400 dark:bg-gray-900 dark:text-gray-600'
                                            }`}
                                        >
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab content */}
                <div className="rounded-xl border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    {/* ── Overview ── */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {[
                                    {
                                        label: 'Total Voters',
                                        value: election.voters?.length || 0,
                                        icon: Users,
                                        bg: 'bg-red-100 dark:bg-red-900/30',
                                        color: 'text-red-600',
                                    },
                                    {
                                        label: 'Ballots',
                                        value: election.ballots?.length || 0,
                                        icon: FileText,
                                        bg: 'bg-blue-100 dark:bg-blue-900/30',
                                        color: 'text-blue-600',
                                    },
                                    {
                                        label: 'Candidates',
                                        value: totalCandidates,
                                        icon: UserCheck,
                                        bg: 'bg-green-100 dark:bg-green-900/30',
                                        color: 'text-green-600',
                                    },
                                    {
                                        label: 'Votes Cast',
                                        value: election.votes_count || 0,
                                        icon: BarChart3,
                                        bg: 'bg-purple-100 dark:bg-purple-900/30',
                                        color: 'text-purple-600',
                                    },
                                ].map(
                                    ({
                                        label,
                                        value,
                                        icon: Icon,
                                        bg,
                                        color,
                                    }) => (
                                        <div
                                            key={label}
                                            className="rounded-lg border border-[#e3e3e0] p-4 dark:border-[#3E3E3A]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`rounded-full p-2 ${bg}`}
                                                >
                                                    <Icon
                                                        className={`h-5 w-5 ${color}`}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {label}
                                                    </p>
                                                    <p className="text-2xl font-bold text-[#1b1b18] dark:text-white">
                                                        {value}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {[
                                    {
                                        label: 'Start Date',
                                        value: election.start_date,
                                    },
                                    {
                                        label: 'End Date',
                                        value: election.end_date,
                                    },
                                ].map(({ label, value }) => (
                                    <div
                                        key={label}
                                        className="rounded-lg border border-[#e3e3e0] p-4 dark:border-[#3E3E3A]"
                                    >
                                        <h3 className="mb-3 font-semibold text-[#1b1b18] dark:text-white">
                                            {label}
                                        </h3>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                {value
                                                    ? new Date(
                                                          value,
                                                      ).toLocaleString()
                                                    : 'Not set'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-[#1b1b18] dark:text-white">
                                    Election URLs
                                </h3>
                                {[
                                    { label: 'Election URL', url: electionUrl },
                                    {
                                        label: 'Leaderboard URL',
                                        url: leaderboardUrl,
                                    },
                                ].map(({ label, url}) => (
                                    <div
                                        key={label}
                                        className="rounded-lg border border-[#e3e3e0] p-4 dark:border-[#3E3E3A]"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {label}

                                                </p>
                                                <code className="mt-1 block truncate text-sm text-blue-600 dark:text-blue-400">
                                                    {url}
                                                </code>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    copyToClipboard(url)
                                                }
                                                className="ml-4 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {copied && (
                                    <div className="fixed right-4 bottom-4 animate-in rounded-lg bg-green-600 px-4 py-2 text-sm text-white shadow-lg fade-in slide-in-from-bottom-2">
                                        Copied to clipboard!
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Ballots ── */}
                    {activeTab === 'ballots' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-white">
                                    Ballot Questions
                                    {election.ballots &&
                                        election.ballots.length > 0 && (
                                            <span className="ml-2 text-sm font-normal text-gray-500">
                                                ({election.ballots.length}{' '}
                                                total)
                                            </span>
                                        )}
                                </h3>
                                <button
                                    onClick={() => {
                                        if (!isEditable) {
                                            alert('This election is not in draft mode. You cannot add ballots.');
                                            return;
                                        }
                                        setIsBallotModalOpen(true);
                                    }}
                                    className={`rounded-lg px-3 py-1.5 text-sm text-white transition-all ${
                                        isEditable
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                    disabled={!isEditable}
                                >
                                    + Add Question
                                </button>
                            </div>

                            {!isEditable && (
                                <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                                    <div className="flex items-start gap-2">
                                        <Lock className="mt-0.5 h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                            This election is {election.status}. You cannot add or modify ballots.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {election.ballots && election.ballots.length > 0 ? (
                                <div className="space-y-6">
                                    {election.ballots
                                        .sort(
                                            (a, b) =>
                                                (a.display_order || 0) -
                                                (b.display_order || 0),
                                        )
                                        .map((ballot, index) => {
                                            const colors =
                                                ballotTypeColors[ballot.type] ||
                                                ballotTypeColors.text;
                                            return (
                                                <div
                                                    key={ballot.id}
                                                    className={`group overflow-hidden rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615] ${!isEditable ? 'opacity-75' : ''}`}
                                                >
                                                    <div
                                                        className={`flex items-start justify-between px-5 py-4 ${colors.bg} border-b ${colors.border}`}
                                                    >
                                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                                            <span
                                                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${colors.bg} ${colors.text} border text-xs font-semibold ${colors.border}`}
                                                            >
                                                                {ballot.display_order ||
                                                                    index + 1}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <h4
                                                                    className={`truncate font-semibold ${colors.text}`}
                                                                >
                                                                    {
                                                                        ballot.title
                                                                    }
                                                                </h4>
                                                                {ballot.description && (
                                                                    <p className="mt-0.5 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
                                                                        {
                                                                            ballot.description
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <span
                                                                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
                                                            >
                                                                {getBallotTypeLabel(
                                                                    ballot.type,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="ml-3 flex items-center gap-1">
                                                            <button
                                                                onClick={() =>
                                                                    handleManageOptions(
                                                                        ballot,
                                                                    )
                                                                }
                                                                title={isEditable ? "Manage options" : "Read-only"}
                                                                className={`rounded p-1.5 ${
                                                                    isEditable
                                                                        ? 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800'
                                                                        : 'text-gray-300 cursor-not-allowed'
                                                                }`}
                                                                disabled={!isEditable}
                                                            >
                                                                <Settings className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteBallotClick(
                                                                        ballot,
                                                                    )
                                                                }
                                                                title={isEditable ? "Delete ballot" : "Read-only"}
                                                                className={`rounded p-1.5 ${
                                                                    isEditable
                                                                        ? 'text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'
                                                                        : 'text-gray-300 cursor-not-allowed'
                                                                }`}
                                                                disabled={!isEditable}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="p-5">
                                                        {ballot.options &&
                                                        ballot.options.length >
                                                            0 ? (
                                                            <>
                                                                <p className="mb-3 text-xs font-medium tracking-wide text-gray-400 uppercase dark:text-gray-600">
                                                                    {
                                                                        ballot
                                                                            .options
                                                                            .length
                                                                    }{' '}
                                                                    {ballot
                                                                        .options
                                                                        .length ===
                                                                    1
                                                                        ? 'option'
                                                                        : 'options'}
                                                                </p>
                                                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                                                    {ballot.options
                                                                        .sort(
                                                                            (
                                                                                a,
                                                                                b,
                                                                            ) =>
                                                                                (a.display_order ||
                                                                                    0) -
                                                                                (b.display_order ||
                                                                                    0),
                                                                        )
                                                                        .map(
                                                                            (
                                                                                option,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        option.id
                                                                                    }
                                                                                    className={`group/opt flex items-center gap-3 rounded-lg border border-[#e3e3e0] p-3 transition-all ${
                                                                                        isEditable
                                                                                            ? 'hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600'
                                                                                            : 'opacity-75'
                                                                                    } dark:border-[#3E3E3A]`}
                                                                                >
                                                                                    {option.should_display_a_photo &&
                                                                                    option.photo_url ? (
                                                                                        <img
                                                                                            src={
                                                                                                option.photo_url
                                                                                            }
                                                                                            alt={
                                                                                                option.title
                                                                                            }
                                                                                            className="h-10 w-10 shrink-0 rounded-full border border-[#e3e3e0] object-cover dark:border-[#3E3E3A]"
                                                                                        />
                                                                                    ) : option.should_display_a_photo ? (
                                                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                                                                            <ImageIcon className="h-4 w-4 text-gray-400" />
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                                                            {option.title
                                                                                                .charAt(
                                                                                                    0,
                                                                                                )
                                                                                                .toUpperCase()}
                                                                                        </div>
                                                                                    )}

                                                                                    <div className="min-w-0 flex-1">
                                                                                        <p className="truncate text-sm font-medium text-[#1b1b18] dark:text-white">
                                                                                            {
                                                                                                option.title
                                                                                            }
                                                                                        </p>
                                                                                        {option.description && (
                                                                                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                                                                                {
                                                                                                    option.description
                                                                                                }
                                                                                            </p>
                                                                                        )}
                                                                                    </div>

                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleDeleteOptionClick(
                                                                                                option,
                                                                                                ballot,
                                                                                            )
                                                                                        }
                                                                                        title={isEditable ? "Remove option" : "Read-only"}
                                                                                        className={`shrink-0 rounded p-1 ${
                                                                                            isEditable
                                                                                                ? 'text-gray-300 opacity-0 transition-all group-hover/opt:opacity-100 hover:bg-red-50 hover:text-red-500 dark:text-gray-600 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                                                                                                : 'text-gray-200 cursor-not-allowed'
                                                                                        }`}
                                                                                        disabled={!isEditable}
                                                                                    >
                                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                                    </button>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-[#e3e3e0] py-6 dark:border-[#3E3E3A]">
                                                                <div className="text-center">
                                                                    <p className="text-sm text-gray-400 dark:text-gray-600">
                                                                        No
                                                                        options
                                                                        yet
                                                                    </p>
                                                                    {isEditable && (
                                                                        <button
                                                                            onClick={() =>
                                                                                handleManageOptions(
                                                                                    ballot,
                                                                                )
                                                                            }
                                                                            className="mt-1 text-xs text-red-600 hover:underline dark:text-red-500"
                                                                        >
                                                                            Add
                                                                            options
                                                                            →
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400 dark:text-gray-600">
                                                            <span>
                                                                Max selections:{' '}
                                                                {
                                                                    ballot.max_selections
                                                                }
                                                            </span>
                                                            {ballot.type ===
                                                                'multiple_choice' && (
                                                                <span>
                                                                    Min:{' '}
                                                                    {
                                                                        ballot.min_selections
                                                                    }
                                                                </span>
                                                            )}
                                                            <span>
                                                                Randomize:{' '}
                                                                {ballot.randomize_options
                                                                    ? 'Yes'
                                                                    : 'No'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <div className="rounded-lg border-2 border-dashed border-[#e3e3e0] p-8 text-center dark:border-[#3E3E3A]">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                        No ballots yet
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {isEditable
                                            ? 'Add your first ballot question to get started.'
                                            : 'This election is in read-only mode. Ballots cannot be added.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Voters ── */}
                    {activeTab === 'voters' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-white">
                                    Voters
                                    {election.voters &&
                                        election.voters.length > 0 && (
                                            <span className="ml-2 text-sm font-normal text-gray-500">
                                                ({election.voters.length}{' '}
                                                registered)
                                            </span>
                                        )}
                                </h3>
                                <button
                                    onClick={() => setIsAddVoterModalOpen(true)}
                                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-white transition-all ${
                                        isEditable
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                    disabled={!isEditable}
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Voters
                                </button>
                            </div>

                            {!isEditable && (
                                <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                                    <div className="flex items-start gap-2">
                                        <Lock className="mt-0.5 h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                            This election is {election.status}. You cannot add or modify voters.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {election.voters && election.voters.length > 0 ? (
                                <div className="overflow-hidden rounded-lg border border-[#e3e3e0] dark:border-[#3E3E3A]">
                                    <table className="w-full text-sm">
                                        <thead className="border-b border-[#e3e3e0] bg-gray-50 dark:border-[#3E3E3A] dark:bg-gray-900/40">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                                    Name
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                                    Voter ID
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                                    Email
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                                    Voter Token
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                                    Invited
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                                            {election.voters.map((voter) => (
                                                <tr
                                                    key={voter.id}
                                                    className="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/20"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                                {voter.name
                                                                    ?.charAt(0)
                                                                    .toUpperCase() ||
                                                                    '?'}
                                                            </div>
                                                            <span className="font-medium text-[#1b1b18] dark:text-white">
                                                                {voter.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {voter.voter_id ? (
                                                            <code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
                                                                {voter.voter_id}
                                                            </code>
                                                        ) : (
                                                            <span className="text-gray-400">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                        {voter.email || (
                                                            <span className="text-gray-400">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
                                                            {voter.voter_token}
                                                        </code>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {voter.has_voted ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                <CheckCircle className="h-3 w-3" />{' '}
                                                                Voted
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                                <Clock className="h-3 w-3" />{' '}
                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                        {voter.invited_at
                                                            ? new Date(
                                                                  voter.invited_at,
                                                              ).toLocaleDateString()
                                                            : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteVoterClick(
                                                                    voter,
                                                                )
                                                            }
                                                            title={isEditable ? "Remove voter" : "Read-only"}
                                                            className={`rounded p-1 ${
                                                                isEditable
                                                                    ? 'text-gray-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:text-gray-600 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                                                                    : 'text-gray-200 cursor-not-allowed'
                                                            }`}
                                                            disabled={!isEditable}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="rounded-lg border-2 border-dashed border-[#e3e3e0] p-8 text-center dark:border-[#3E3E3A]">
                                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                        No voters added yet
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {isEditable
                                            ? 'Add voters individually or import a CSV file.'
                                            : 'This election is in read-only mode. Voters cannot be added.'}
                                    </p>
                                    {isEditable && (
                                        <button
                                            onClick={() =>
                                                setIsAddVoterModalOpen(true)
                                            }
                                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Voters
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Preview ── */}
                    {activeTab === 'preview' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-white">
                                    Election Preview
                                </h3>
                                <div className="flex gap-2">
                                    {election.ballots.length > 0 && (
                                        <a
                                            href={previewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                                        >
                                            Open Preview{' '}
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                <div className="flex items-start gap-3">
                                    <EyeIcon className="mt-0.5 h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-blue-800 dark:text-blue-400">
                                            Preview Mode - Always Available
                                        </p>
                                        <p className="mt-1 text-sm text-blue-700 dark:text-blue-500">
                                            The preview is always accessible, regardless of the election status.
                                            {election.status === 'draft' && ' Use it to test your election before launching.'}
                                            {election.status === 'active' && ' See exactly what voters are seeing right now.'}
                                            {election.status === 'completed' && ' Review how the election appeared to voters.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {election.ballots.length > 0 ? (
                                <div className="rounded-lg border border-[#e3e3e0] bg-gray-50 p-6 dark:border-[#3E3E3A] dark:bg-gray-900/20">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#161615]">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Ballots
                                            </p>
                                            <p className="text-2xl font-bold text-[#1b1b18] dark:text-white">
                                                {election.ballots.length}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Questions voters will answer
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#161615]">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Options
                                            </p>
                                            <p className="text-2xl font-bold text-[#1b1b18] dark:text-white">
                                                {totalCandidates}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Total choices available
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-[#e3e3e0] bg-gray-50 p-6 dark:border-[#3E3E3A] dark:bg-gray-900/20">
                                    <p className="text-center text-gray-600 dark:text-gray-400">
                                        Preview will be available once you add
                                        ballots to your election.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Launch ── */}
                    {activeTab === 'launch' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-white">
                                Launch Election
                            </h3>
                            {election.status === 'draft' ? (
                                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium text-yellow-800 dark:text-yellow-400">
                                                Ready to launch?
                                            </p>
                                            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-500">
                                                Once launched, voters will be
                                                able to access the election and
                                                cast their votes.
                                            </p>
                                            <button
                                                onClick={() =>
                                                    setIsLaunchModalOpen(true)
                                                }
                                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                            >
                                                <Rocket className="h-4 w-4" />
                                                Review & Launch
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : election.status === 'active' ? (
                                <div className="space-y-4">
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-medium text-green-800 dark:text-green-400">
                                                    Election is active
                                                </p>
                                                <p className="mt-1 text-sm text-green-700 dark:text-green-500">
                                                    Voters can currently access
                                                    the election and cast their
                                                    votes.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-5 dark:border-yellow-800 dark:bg-yellow-900/20">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                                                <div>
                                                    <p className="font-medium text-yellow-800 dark:text-yellow-400">
                                                        Pause Election
                                                    </p>
                                                    <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-500">
                                                        Temporarily stop voting.
                                                        Voters won't be able to
                                                        cast votes until you
                                                        resume.
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    'Are you sure you want to pause this election?',
                                                                )
                                                            ) {
                                                                router.post(
                                                                    `/elections/${election.id}/pause`,
                                                                    {},
                                                                    {
                                                                        onSuccess:
                                                                            () =>
                                                                                router.reload(),
                                                                    },
                                                                );
                                                            }
                                                        }}
                                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700"
                                                    >
                                                        <Clock className="h-4 w-4" />
                                                        Pause Election
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/20">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                                                <div>
                                                    <p className="font-medium text-red-800 dark:text-red-400">
                                                        End Election
                                                    </p>
                                                    <p className="mt-1 text-sm text-red-700 dark:text-red-500">
                                                        Permanently close
                                                        voting. This cannot be
                                                        undone — no more votes
                                                        will be accepted.
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    'Are you sure you want to end this election? This cannot be undone.',
                                                                )
                                                            ) {
                                                                router.post(
                                                                    `/elections/${election.id}/end`,
                                                                    {},
                                                                    {
                                                                        onSuccess:
                                                                            () =>
                                                                                router.reload(),
                                                                    },
                                                                );
                                                            }
                                                        }}
                                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                        End Election
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : election.status === 'paused' ? (
                                <div className="space-y-4">
                                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                                            <div>
                                                <p className="font-medium text-yellow-800 dark:text-yellow-400">
                                                    Election is paused
                                                </p>
                                                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-500">
                                                    Voting is temporarily
                                                    suspended. Resume to allow
                                                    voters to continue casting
                                                    votes.
                                                </p>
                                                <div className="mt-4 flex gap-3">
                                                    <button
                                                        onClick={() => {
                                                            router.post(
                                                                `/elections/${election.id}/resume`,
                                                                {},
                                                                {
                                                                    onSuccess:
                                                                        () =>
                                                                            router.reload(),
                                                                },
                                                            );
                                                        }}
                                                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                                                    >
                                                        <Rocket className="h-4 w-4" />
                                                        Resume Election
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    'Are you sure you want to end this election? This cannot be undone.',
                                                                )
                                                            ) {
                                                                router.post(
                                                                    `/elections/${election.id}/end`,
                                                                    {},
                                                                    {
                                                                        onSuccess:
                                                                            () =>
                                                                                router.reload(),
                                                                    },
                                                                );
                                                            }
                                                        }}
                                                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                        End Election
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/20">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="mt-0.5 h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="font-medium text-gray-700 dark:text-gray-300">
                                                Election is {election.status}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                This election has ended and is
                                                now {election.status}.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modals ── */}
            <CreateBallotModal
                isOpen={isBallotModalOpen}
                onClose={() => setIsBallotModalOpen(false)}
                electionId={election.id}
            />

            <OptionModal
                isOpen={isOptionModalOpen}
                onClose={() => {
                    setIsOptionModalOpen(false);
                    setSelectedBallot(null);
                }}
                ballot={selectedBallot}
                electionId={election.id}
            />

            <AddVoterModal
                isOpen={isAddVoterModalOpen}
                onClose={() => setIsAddVoterModalOpen(false)}
                electionId={election.id}
                isEditable={isEditable}
            />

            <LeaderboardSettingsModal
                isOpen={isLeaderboardModalOpen}
                onClose={() => setIsLeaderboardModalOpen(false)}
                election={election}
            />

            <LaunchConfirmationModal
                isOpen={isLaunchModalOpen}
                onClose={() => setIsLaunchModalOpen(false)}
                onConfirm={handleLaunch}
                election={election}
            />

            <SubscribeConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                    setIsConfirmModalOpen(false);
                    setSelectedPlan(null);
                }}
                onConfirm={handleConfirmSubscription}
                plan={selectedPlan}
                electionId={election.id}
                isLoading={isLoading}
            />

            <CustomDeleteConfirmationModal
                isOpen={deleteModalConfig.isOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={deleteModalConfig.onConfirm}
                title={deleteModalConfig.title}
                message={deleteModalConfig.message}
                itemName={deleteModalConfig.itemName}
            />
        </AdminLayout>
    );
}