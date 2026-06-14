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
} from 'lucide-react';
import { useState, useRef } from 'react';
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
    email: string;
    has_voted?: boolean;
    voted_at?: string | null;
}

interface Vote {
    id: number;
    option_id: number;
    voter_id: number;
    ballot_id: number;
    election_id: number;
    metadata?: Record<string, any>;
    ip_address?: string | null;
    voter_token?: string | null;
     created_at: string;
     updated_at: string;
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
    ballots?: Ballot[];
    voters?: Voter[];
    voters_count?: number;
    votes_count?: number;
}

interface Props {
    election: Election;
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

// ─── Add Voter Modal ──────────────────────────────────────────────────────────
function AddVoterModal({
    isOpen,
    onClose,
    electionId,
}: {
    isOpen: boolean;
    onClose: () => void;
    electionId: number;
}) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [saving, setSaving] = useState(false);
    const [importing, setImporting] = useState(false);
    const fileRef = useRef<HTMLInputElement | null>(null);

    if (!isOpen) return null;

    const handleAddSingle = () => {
        if (!name.trim() || !email.trim()) return;
        setSaving(true);
        router.post(
            `/elections/${electionId}/voters`,
            { name, email },
            {
                onSuccess: () => {
                    setSaving(false);
                    setName('');
                    setEmail('');
                    onClose();
                    router.reload();
                },
                onError: () => {
                    setSaving(false);
                },
            },
        );
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            'name,email\nJane Doe,jane@example.com\nJohn Smith,john@example.com\n';
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
                            Add individually or import a CSV file
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
                    <div className="space-y-3">
                        <div className="relative">
                            <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Full name"
                                className="w-full rounded-lg border border-[#e3e3e0] py-2 pr-3 pl-9 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleAddSingle()
                                }
                                className="w-full rounded-lg border border-[#e3e3e0] py-2 pr-3 pl-9 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                            />
                        </div>
                        <button
                            onClick={handleAddSingle}
                            disabled={saving || !name.trim() || !email.trim()}
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
                            disabled={importing}
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
                        CSV must have <code className="font-mono">name</code>{' '}
                        and <code className="font-mono">email</code> columns.
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ElectionShow({ election }: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const [copied, setCopied] = useState(false);
    const [isBallotModalOpen, setIsBallotModalOpen] = useState(false);
    const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddVoterModalOpen, setIsAddVoterModalOpen] = useState(false);
    const [selectedBallot, setSelectedBallot] = useState<Ballot | null>(null);
    const [ballotToDelete, setBallotToDelete] = useState<Ballot | null>(null);
    const [optionToDelete, setOptionToDelete] = useState<{
        option: Option;
        ballot: Ballot;
    } | null>(null);
    const [voterToDelete, setVoterToDelete] = useState<Voter | null>(null);

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
        setSelectedBallot(ballot);
        setIsOptionModalOpen(true);
    };

    const handleDeleteBallotClick = (ballot: Ballot) => {
        setBallotToDelete(ballot);
        setOptionToDelete(null);
        setVoterToDelete(null);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteOptionClick = (option: Option, ballot: Ballot) => {
        setOptionToDelete({ option, ballot });
        setBallotToDelete(null);
        setVoterToDelete(null);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteVoterClick = (voter: Voter) => {
        setVoterToDelete(voter);
        setBallotToDelete(null);
        setOptionToDelete(null);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (ballotToDelete) {
            router.delete(`/ballots/${ballotToDelete.id}`);
        } else if (optionToDelete) {
            router.delete(`/options/${optionToDelete.option.id}`);
        } else if (voterToDelete) {
            router.delete(`/voters/${voterToDelete.id}`);
        }
        setIsDeleteModalOpen(false);
        setBallotToDelete(null);
        setOptionToDelete(null);
        setVoterToDelete(null);
    };

    const electionUrl = `${window.location.origin}/vote/${election.identifier}`;
    const shortUrl = `https://vote.voicesphere.com/e/${election.identifier.substring(0, 6)}`;

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
                <div className="flex items-center gap-4">
                    <Link
                        href="/elections"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-500"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Elections
                    </Link>
                </div>

                {/* Title + status */}
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
                        </div>
                        <div
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${statusConfig.color}`}
                        >
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                        </div>
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
                                        value: election.votes?.length || 0,
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
                                    { label: 'Short URL', url: shortUrl },
                                ].map(({ label, url }) => (
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
                                        {label === 'Election URL' &&
                                            election.status !== 'active' && (
                                                <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-500">
                                                    ⚠️ This URL will not be
                                                    accessible until the
                                                    election has been launched.
                                                </p>
                                            )}
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
                                    onClick={() => setIsBallotModalOpen(true)}
                                    className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                                >
                                    + Add Question
                                </button>
                            </div>

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
                                                    className="group overflow-hidden rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]"
                                                >
                                                    {' '}
                                                    {/* Ballot header with subtle color */}
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
                                                            {' '}
                                                            <button
                                                                onClick={() =>
                                                                    handleManageOptions(
                                                                        ballot,
                                                                    )
                                                                }
                                                                title="Manage options"
                                                                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                                                            >
                                                                <Settings className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteBallotClick(
                                                                        ballot,
                                                                    )
                                                                }
                                                                title="Delete ballot"
                                                                className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {/* Options / Candidates grid */}
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
                                                                                    className="group/opt flex items-center gap-3 rounded-lg border border-[#e3e3e0] p-3 transition-all hover:border-gray-300 hover:shadow-sm dark:border-[#3E3E3A] dark:hover:border-gray-600"
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
                                                                                        title="Remove option"
                                                                                        className="shrink-0 rounded p-1 text-gray-300 opacity-0 transition-all group-hover/opt:opacity-100 hover:bg-red-50 hover:text-red-500 dark:text-gray-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
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
                                        Add your first ballot question to get
                                        started.
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
                                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Voters
                                </button>
                            </div>

                            {election.voters && election.voters.length > 0 ? (
                                <div className="overflow-hidden rounded-lg border border-[#e3e3e0] dark:border-[#3E3E3A]">
                                    <table className="w-full text-sm">
                                        <thead className="border-b border-[#e3e3e0] bg-gray-50 dark:border-[#3E3E3A] dark:bg-gray-900/40">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                                    Name
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                                    Email
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                                    Status
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
                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                        {voter.email}
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
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteVoterClick(
                                                                    voter,
                                                                )
                                                            }
                                                            className="rounded p-1 text-gray-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:text-gray-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                                            title="Remove voter"
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
                                        Add voters individually or import a CSV
                                        file.
                                    </p>
                                    <button
                                        onClick={() =>
                                            setIsAddVoterModalOpen(true)
                                        }
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Voters
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Preview ── */}
                    {activeTab === 'preview' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-white">
                                Election Preview
                            </h3>
                            <div className="rounded-lg border border-[#e3e3e0] bg-gray-50 p-6 dark:border-[#3E3E3A] dark:bg-gray-900/20">
                                <p className="text-center text-gray-600 dark:text-gray-400">
                                    Preview will be available once you add
                                    ballots to your election.
                                </p>
                            </div>
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
                                                    router.post(
                                                        `/elections/${election.id}/publish`,
                                                    )
                                                }
                                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                            >
                                                <Rocket className="h-4 w-4" />
                                                Launch Election
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium text-green-800 dark:text-green-400">
                                                Election is {election.status}
                                            </p>
                                            <p className="mt-1 text-sm text-green-700 dark:text-green-500">
                                                This election has already been
                                                launched and is{' '}
                                                {election.status === 'active'
                                                    ? 'ongoing'
                                                    : election.status}
                                                .
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
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setBallotToDelete(null);
                    setOptionToDelete(null);
                    setVoterToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title={
                    ballotToDelete
                        ? 'Delete Ballot Question'
                        : optionToDelete
                          ? 'Remove Option'
                          : 'Remove Voter'
                }
                message={
                    ballotToDelete
                        ? 'This action cannot be undone. This will permanently delete the ballot question and all its options.'
                        : optionToDelete
                          ? 'This will permanently remove this option from the ballot. Voters will no longer see it.'
                          : 'This will permanently remove this voter from the election. They will no longer be able to vote.'
                }
                itemName={
                    ballotToDelete?.title ||
                    optionToDelete?.option.title ||
                    voterToDelete?.name ||
                    ''
                }
            />
        </AdminLayout>
    );
}
