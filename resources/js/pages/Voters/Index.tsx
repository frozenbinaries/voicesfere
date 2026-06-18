// resources/js/pages/Voters/Index.tsx
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Users,
    Search,
    Download,
    Upload,
    Plus,
    X,
    User,
    Mail,
    CheckCircle,
    Clock,
    Trash2,
    ChevronDown,
    Calendar,
    FileText,
    AlertCircle,
    Filter,
    BarChart3,
    IdCard,
} from 'lucide-react';

import { useState, useRef, useEffect } from 'react';

interface Voter {
    id: number;
    election_id: number;
    name: string;
    email: string | null;
    voter_id: string | null;
    voter_token: string;
    has_voted: boolean;
    invited_at: string | null;
    voted_at: string | null;
    created_at: string;
    updated_at: string;
}

interface Election {
    id: number;
    title: string;
    description: string | null;
    status: string;
    start_date: string | null;
    end_date: string | null;
    identifier: string;
    voters_count?: number;
    voters?: Voter[];
}

interface Props {
    elections: Election[];
    selectedElectionId?: number;
}

// ─── Add Voter Modal ──────────────────────────────────────────────────────────
function AddVoterModal({
    isOpen,
    onClose,
    electionId,
    electionTitle,
    onSuccess,
}: {
    isOpen: boolean;
    onClose: () => void;
    electionId: number;
    electionTitle: string;
    onSuccess?: () => void;
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
    const [importErrors, setImportErrors] = useState<string[]>([]);
    const [importSuccess, setImportSuccess] = useState(false);
    const fileRef = useRef<HTMLInputElement | null>(null);

    if (!isOpen) return null;

    const handleAddSingle = () => {
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
                    if (onSuccess) onSuccess();
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
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setImportErrors([]);
        setImportSuccess(false);

        const formData = new FormData();
        formData.append('file', file);

        router.post(`/elections/${electionId}/voters/import`, formData, {
            forceFormData: true,
            onSuccess: (page) => {
                setImporting(false);
                setImportSuccess(true);

                if (page.props.flash?.success) {
                    alert(page.props.flash.success);
                }

                setTimeout(() => {
                    onClose();
                    if (onSuccess) onSuccess();
                }, 1500);
            },
            onError: (errors) => {
                setImporting(false);
                if (errors.file) {
                    setImportErrors([errors.file]);
                } else {
                    setImportErrors([
                        'Failed to import voters. Please check the file format and try again.',
                    ]);
                }
            },
        });
    };

    const downloadTemplate = () => {
        // Create CSV content with headers and sample data
        const csv = 'name,voter_id,email';

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        // Create filename with election name and timestamp
        const sanitizedElectionName = electionTitle.replace(/\s+/g, '_');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        const filename = `${sanitizedElectionName}_template_${timestamp}.csv`;

        a.href = url;
        a.download = filename;
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
                    {importSuccess && (
                        <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                            <p className="text-sm text-green-800 dark:text-green-300">
                                ✓ Voters imported successfully!
                            </p>
                        </div>
                    )}

                    {importErrors.length > 0 && (
                        <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                            <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                Import Errors:
                            </p>
                            <ul className="mt-1 list-inside list-disc text-xs text-red-700 dark:text-red-400">
                                {importErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
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
                                className={`w-full rounded-lg border ${
                                    errors.name
                                        ? 'border-red-500'
                                        : 'border-[#e3e3e0]'
                                } py-2 pr-3 pl-9 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white`}
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
                                className={`w-full rounded-lg border ${
                                    errors.voter_id
                                        ? 'border-red-500'
                                        : 'border-[#e3e3e0]'
                                } py-2 pr-3 pl-9 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white`}
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
                                className={`w-full rounded-lg border ${
                                    errors.email
                                        ? 'border-red-500'
                                        : 'border-[#e3e3e0]'
                                } py-2 pr-3 pl-9 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white`}
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

                        <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                            <div className="flex items-start gap-2">
                                <svg
                                    className="mt-0.5 h-4 w-4 text-yellow-600 dark:text-yellow-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <div className="text-xs text-yellow-800 dark:text-yellow-300">
                                    <p className="font-medium">Requirement:</p>
                                    <p className="mt-1">
                                        Either <strong>Email</strong> or{' '}
                                        <strong>Voter ID</strong> must be
                                        provided. Both can also be provided.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                            <div className="flex items-start gap-2">
                                <svg
                                    className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <div className="text-xs text-blue-800 dark:text-blue-300">
                                    <p className="font-medium">Voter Token</p>
                                    <p className="mt-1">
                                        A unique voter token will be
                                        automatically generated and sent to the
                                        voter's email address (if provided).
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleAddSingle}
                            disabled={saving || !name.trim()}
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

// ─── Delete Confirmation Modal ──────────────────────────────────────────────
function DeleteVoterModal({
    isOpen,
    onClose,
    onConfirm,
    voterName,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    voterName: string;
}) {
    const [confirmText, setConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (confirmText !== voterName) return;
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
                                Remove Voter
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
                        You are about to remove{' '}
                        <span className="font-semibold text-red-600">
                            {voterName}
                        </span>{' '}
                        from this election. They will no longer be able to vote.
                    </p>
                    <div className="mt-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Type{' '}
                            <span className="font-bold text-red-600">
                                {voterName}
                            </span>{' '}
                            to confirm:
                        </p>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                            placeholder={`Type "${voterName}" to confirm`}
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
                            disabled={confirmText !== voterName || deleting}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
                        >
                            {deleting ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            Remove Voter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Export Voters Modal ──────────────────────────────────────────────────────
function ExportVotersModal({
    isOpen,
    onClose,
    electionId,
    electionTitle,
    totalVoters,
}: {
    isOpen: boolean;
    onClose: () => void;
    electionId: number;
    electionTitle: string;
    totalVoters: number;
}) {
    const [exporting, setExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState<'full' | 'names'>('full');

    if (!isOpen) return null;

    const handleExport = () => {
        setExporting(true);
        window.location.href = `/elections/${electionId}/voters/export?format=${exportFormat}`;
        setTimeout(() => {
            setExporting(false);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md animate-in rounded-xl bg-white shadow-xl duration-200 fade-in zoom-in dark:bg-[#161615]">
                <div className="flex items-center justify-between border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                    <div>
                        <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-white">
                            Export Voters
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Download voter list as CSV
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            Exporting <strong>{totalVoters}</strong> voters from{' '}
                            <strong>{electionTitle}</strong>
                        </p>
                    </div>

                    <div className="mt-4 space-y-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Export Format
                        </label>
                        <div className="space-y-2">
                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#e3e3e0] p-3 hover:bg-gray-50 dark:border-[#3E3E3A] dark:hover:bg-gray-800">
                                <input
                                    type="radio"
                                    name="exportFormat"
                                    value="full"
                                    checked={exportFormat === 'full'}
                                    onChange={() => setExportFormat('full')}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                                />
                                <div>
                                    <p className="text-sm font-medium text-[#1b1b18] dark:text-white">
                                        Full Export
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Includes: Name, Voter ID, Email, Voter
                                        Token, Status, Invited Date, Voted Date
                                    </p>
                                </div>
                            </label>
                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#e3e3e0] p-3 hover:bg-gray-50 dark:border-[#3E3E3A] dark:hover:bg-gray-800">
                                <input
                                    type="radio"
                                    name="exportFormat"
                                    value="names"
                                    checked={exportFormat === 'names'}
                                    onChange={() => setExportFormat('names')}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                                />
                                <div>
                                    <p className="text-sm font-medium text-[#1b1b18] dark:text-white">
                                        Names Only
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Includes: Name only (simple list of
                                        voter names)
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-[#3E3E3A] dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
                        >
                            {exporting ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VotersIndex({ elections, selectedElectionId }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedElection, setSelectedElection] = useState<Election | null>(
        elections.find((e) => e.id === selectedElectionId) ||
            elections[0] ||
            null,
    );
    const [isAddVoterModalOpen, setIsAddVoterModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [voterToDelete, setVoterToDelete] = useState<Voter | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Function to refresh data by forcing a re-render
    const refreshData = () => {
        window.location.reload();
    };

    // Refresh data when the component mounts or refreshKey changes
    useEffect(() => {
        // You can add any refresh logic here
    }, [refreshKey]);

    const currentVoters = selectedElection?.voters || [];

    const filteredVoters = currentVoters.filter((voter) => {
        const matchesSearch =
            searchTerm === '' ||
            voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (voter.email &&
                voter.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (voter.voter_id &&
                voter.voter_id
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())) ||
            voter.voter_token.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleDeleteVoter = (voter: Voter) => {
        setVoterToDelete(voter);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (voterToDelete) {
            router.delete(`/voters/${voterToDelete.id}`, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setVoterToDelete(null);
                    refreshData();
                },
                onError: (errors) => {
                    console.error('Failed to delete voter:', errors);
                },
            });
        }
    };

    const totalVoters = currentVoters.length;
    const votedCount = currentVoters.filter((v) => v.has_voted).length;
    const pendingCount = totalVoters - votedCount;
    const turnout =
        totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(1) : 0;

    return (
        <AdminLayout title="Voters">
            <Head title="Voters - VoiceSphere" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-[#1b1b18] dark:text-white">
                            Voters
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Manage voters across all your elections
                        </p>
                    </div>
                </div>

                {/* Election Selector */}
                <div className="rounded-xl border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setIsDropdownOpen(!isDropdownOpen)
                                }
                                className="flex w-64 items-center justify-between rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                            >
                                <span className="truncate">
                                    {selectedElection?.title ||
                                        'Select an election'}
                                </span>
                                <ChevronDown
                                    className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {isDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsDropdownOpen(false)}
                                    />
                                    <div className="absolute top-full left-0 z-20 mt-1 w-64 rounded-lg border border-[#e3e3e0] bg-white shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615]">
                                        {elections.map((election) => (
                                            <button
                                                key={election.id}
                                                onClick={() => {
                                                    setSelectedElection(
                                                        election,
                                                    );
                                                    setIsDropdownOpen(false);
                                                    setSearchTerm('');
                                                }}
                                                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                                            >
                                                <div className="truncate">
                                                    {election.title}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {election.voters?.length ||
                                                        0}{' '}
                                                    voters • {election.status}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {selectedElection && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsExportModalOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-[#e3e3e0] px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-[#3E3E3A] dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    <Download className="h-4 w-4" />
                                    Export
                                </button>
                                <button
                                    onClick={() => setIsAddVoterModalOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-red-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Voters
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {selectedElection ? (
                    <>
                        {/* Stats Cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                                        <Users className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Total Voters
                                        </p>
                                        <p className="text-2xl font-bold text-[#1b1b18] dark:text-white">
                                            {totalVoters}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Voted
                                        </p>
                                        <p className="text-2xl font-bold text-[#1b1b18] dark:text-white">
                                            {votedCount}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30">
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Pending
                                        </p>
                                        <p className="text-2xl font-bold text-[#1b1b18] dark:text-white">
                                            {pendingCount}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                                        <BarChart3 className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Turnout
                                        </p>
                                        <p className="text-2xl font-bold text-[#1b1b18] dark:text-white">
                                            {turnout}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search voters by name, voter ID, email, or voter token..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-[#e3e3e0] py-2 pr-4 pl-10 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                            />
                        </div>

                        {/* Voters Table */}
                        <div className="rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Name
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Voter ID
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Email
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Voter Token
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Invited
                                            </th>
                                            <th className="px-6 py-4 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredVoters.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="px-6 py-12 text-center"
                                                >
                                                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                                        No voters found
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                        {searchTerm
                                                            ? 'Try adjusting your search'
                                                            : 'Add voters to this election'}
                                                    </p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredVoters.map((voter) => (
                                                <tr
                                                    key={voter.id}
                                                    className="border-b border-[#e3e3e0] transition-all hover:bg-gray-50 dark:border-[#3E3E3A] dark:hover:bg-gray-900/50"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                                {voter.name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>
                                                            <span className="font-medium text-[#1b1b18] dark:text-white">
                                                                {voter.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
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
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                        {voter.email || (
                                                            <span className="text-gray-400">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
                                                            {voter.voter_token}
                                                        </code>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {voter.has_voted ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                                <CheckCircle className="h-3 w-3" />
                                                                Voted
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                                                                <Clock className="h-3 w-3" />
                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                        {voter.invited_at
                                                            ? new Date(
                                                                  voter.invited_at,
                                                              ).toLocaleDateString()
                                                            : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteVoter(
                                                                    voter,
                                                                )
                                                            }
                                                            className="rounded p-1 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="border-t border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing {filteredVoters.length} of{' '}
                                    {totalVoters} voters
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="rounded-xl border border-[#e3e3e0] bg-white p-12 text-center dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                            No election selected
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Please select an election from the dropdown above to
                            view its voters.
                        </p>
                    </div>
                )}
            </div>

            {selectedElection && (
                <>
                    <AddVoterModal
                        isOpen={isAddVoterModalOpen}
                        onClose={() => setIsAddVoterModalOpen(false)}
                        electionId={selectedElection.id}
                        electionTitle={selectedElection.title}
                        onSuccess={refreshData}
                    />
                    <ExportVotersModal
                        isOpen={isExportModalOpen}
                        onClose={() => setIsExportModalOpen(false)}
                        electionId={selectedElection.id}
                        electionTitle={selectedElection.title}
                        totalVoters={totalVoters}
                    />
                </>
            )}
            <DeleteVoterModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setVoterToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                voterName={voterToDelete?.name || ''}
            />
        </AdminLayout>
    );
}