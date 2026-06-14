// resources/js/pages/Elections/Index.tsx
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Plus, Search, MoreVertical, Edit, Trash2, Eye, Play, Pause, BarChart3, Calendar, Users, Clock, CheckCircle, FileText, Vote, X, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Candidate {
    id: number;
    name: string;
}

interface Ballot {
    id: number;
    title: string;
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
    candidates?: Candidate[];
    ballots?: Ballot[];
}

interface Props {
    allElections: Election[];
}

// ─── Delete Confirmation Modal ──────────────────────────────────────────────────────────
function DeleteElectionModal({
    isOpen,
    onClose,
    onConfirm,
    electionTitle
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    electionTitle: string;
}) {
    const [confirmText, setConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (confirmText !== electionTitle) return;

        setDeleting(true);
        await onConfirm();
        setDeleting(false);
        onClose();
        setConfirmText('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-[#161615] animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-white">Delete Election</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        You are about to delete <span className="font-semibold text-red-600">{electionTitle}</span>.
                        This will permanently remove the election and all associated data including ballots, options, and votes.
                    </p>

                    <div className="mt-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Type <span className="font-bold text-red-600">{electionTitle}</span> to confirm:
                        </p>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                            placeholder={`Type "${electionTitle}" to confirm`}
                            autoFocus
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-[#3E3E3A] dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={confirmText !== electionTitle || deleting}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
                        >
                            {deleting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Delete Permanently
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Create Election Modal ──────────────────────────────────────────────────────────
function CreateElectionModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess?: () => void }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setError('Please enter an election title');
            return;
        }

        if (!startDate) {
            setError('Please select a start date');
            return;
        }

        if (!endDate) {
            setError('Please select an end date');
            return;
        }

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        if (endDateObj <= startDateObj) {
            setError('End date must be after start date');
            return;
        }

        setSaving(true);
        setError('');

        router.post('/elections', {
            title: title.trim(),
            description: description.trim() || null,
            start_date: startDate,
            end_date: endDate,
        }, {
            onSuccess: () => {
                setSaving(false);
                resetForm();
                onClose();
                if (onSuccess) onSuccess();
                router.reload();
            },
            onError: (errors) => {
                setSaving(false);
                setError(Object.values(errors).join(', '));
            },
        });
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setError('');
    };

    // Get today's datetime in local format for min attribute
    const getTodayDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-[#161615] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                    <div>
                        <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-white">Create New Election</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Set up your election details</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-white">
                            Election Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Presidential Election 2024"
                            className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-white">
                            Description (Optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Describe the purpose of this election..."
                            className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-white">
                                Start Date & Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                min={getTodayDateTime()}
                                className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-white">
                                End Date & Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate || getTodayDateTime()}
                                className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-[#3E3E3A] dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !title.trim() || !startDate || !endDate}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    Create Election
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ElectionsIndex({ allElections }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [menuOpen, setMenuOpen] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [electionToDelete, setElectionToDelete] = useState<Election | null>(null);

    const filteredElections = allElections.filter((election) => {
        const matchesSearch = searchTerm === '' ||
            election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (election.identifier && election.identifier.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === '' || election.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string, election: Election) => {
        const now = new Date();
        const startDate = election.start_date ? new Date(election.start_date) : null;
        const endDate = election.end_date ? new Date(election.end_date) : null;

        let actualStatus = status;
        if (status === 'active') {
            if (startDate && now < startDate) {
                actualStatus = 'upcoming';
            } else if (endDate && now > endDate) {
                actualStatus = 'completed';
            }
        }

        switch (actualStatus) {
            case 'active':
                return (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <Play className="mr-1 h-3 w-3" />
                        Active
                    </span>
                );
            case 'upcoming':
                return (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        <Clock className="mr-1 h-3 w-3" />
                        Upcoming
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Completed
                    </span>
                );
            case 'paused':
                return (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <Pause className="mr-1 h-3 w-3" />
                        Paused
                    </span>
                );
            case 'draft':
                return (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                        Draft
                    </span>
                );
            case 'archived':
                return (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Archived
                    </span>
                );
            default:
                return null;
        }
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDeleteClick = (election: Election, e: React.MouseEvent) => {
        e.stopPropagation();
        setElectionToDelete(election);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (electionToDelete) {
            router.delete(`/elections/${electionToDelete.id}`);
            setIsDeleteModalOpen(false);
            setElectionToDelete(null);
        }
    };

    const handleRowClick = (electionId: number) => {
        router.visit(`/elections/${electionId}`);
    };

    return (
        <AdminLayout title="Elections">
            <Head title="Elections - VoiceSphere" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-[#1b1b18] dark:text-white">Elections</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Manage all your elections from one place
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        type="button"
                        className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 hover:shadow-lg cursor-pointer"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Election
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 rounded-xl border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615] sm:flex-row">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search elections by title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-[#e3e3e0] py-2 pl-10 pr-4 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="w-full sm:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                        >
                            <option value="">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="completed">Completed</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>

                {/* Elections Table */}
                <div className="rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Title</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Start Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">End Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Ballots</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Candidates</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredElections.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="text-center">
                                                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No elections found</h3>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                    Get started by creating your first election.
                                                </p>
                                                <div className="mt-6">
                                                    <button
                                                        onClick={() => setIsCreateModalOpen(true)}
                                                        type="button"
                                                        className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 cursor-pointer"
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        New Election
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredElections.map((election) => (
                                        <tr
                                            key={election.id}
                                            onClick={() => handleRowClick(election.id)}
                                            className="cursor-pointer border-b border-[#e3e3e0] transition-all hover:bg-gray-50 dark:border-[#3E3E3A] dark:hover:bg-gray-900/50"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-[#1b1b18] hover:text-red-600 dark:text-white">
                                                        {election.title}
                                                    </div>
                                                    {election.description && (
                                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                            {election.description.substring(0, 60)}
                                                            {election.description.length > 60 ? '...' : ''}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(election.status, election)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {formatDateTime(election.start_date)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {formatDateTime(election.end_date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-1">
                                                    <FileText className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {election.ballots?.length || 0} ballots
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-1">
                                                    <Users className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {election.candidates?.length || 0} candidates
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setMenuOpen(menuOpen === election.id ? null : election.id);
                                                        }}
                                                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                    {menuOpen === election.id && (
                                                        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-[#e3e3e0] bg-white shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615]">
                                                            <div className="py-1">
                                                                <Link
                                                                    href={`/elections/${election.id}`}
                                                                    className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                                                    onClick={() => setMenuOpen(null)}
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </Link>
                                                                <Link
                                                                    href={`/elections/${election.id}/edit`}
                                                                    className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                                                    onClick={() => setMenuOpen(null)}
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </Link>
                                                                <Link
                                                                    href={`/elections/${election.id}/ballots`}
                                                                    className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                                                    onClick={() => setMenuOpen(null)}
                                                                >
                                                                    <Vote className="mr-2 h-4 w-4" />
                                                                    Manage Ballots
                                                                </Link>
                                                                <Link
                                                                    href={`/elections/${election.id}/results`}
                                                                    className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                                                    onClick={() => setMenuOpen(null)}
                                                                >
                                                                    <BarChart3 className="mr-2 h-4 w-4" />
                                                                    View Results
                                                                </Link>
                                                                {election.status === 'draft' && (
                                                                    <Link
                                                                        href={`/elections/${election.id}/publish`}
                                                                        method="post"
                                                                        as="button"
                                                                        className="flex w-full items-center px-4 py-2 text-left text-sm text-green-700 hover:bg-gray-100 dark:text-green-500 dark:hover:bg-gray-800"
                                                                        onClick={() => setMenuOpen(null)}
                                                                    >
                                                                        <Play className="mr-2 h-4 w-4" />
                                                                        Publish
                                                                    </Link>
                                                                )}
                                                                <button
                                                                    onClick={(e) => {
                                                                        handleDeleteClick(election, e);
                                                                        setMenuOpen(null);
                                                                    }}
                                                                    className="flex w-full items-center px-4 py-2 text-left text-sm text-red-700 hover:bg-gray-100 dark:text-red-500 dark:hover:bg-gray-800"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="border-t border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {filteredElections.length} of {allElections.length} elections
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Election Modal */}
            <CreateElectionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {/* Delete Confirmation Modal */}
            <DeleteElectionModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setElectionToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                electionTitle={electionToDelete?.title || ''}
            />
        </AdminLayout>
    );
}