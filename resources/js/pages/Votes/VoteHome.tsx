import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight, Vote, AlertTriangle, X, Eye, Info, AlertCircle, Star, List, Type, GripVertical, RefreshCw } from 'lucide-react';

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
    type: 'single_choice' | 'multiple_choice' | 'ranked_choice' | 'rating' | 'text';
    max_selections: number;
    min_selections: number;
    randomize_options: boolean;
    options: Option[];
}

interface Election {
    id: number;
    title: string;
    description: string | null;
    identifier: string;
    ballots: Ballot[];
}

interface Voter {
    id: number;
    name: string | null;
    email: string;
}

interface Props {
    election: Election;
    voter: Voter;
    isPreview?: boolean;
}

interface Toast {
    id: number;
    message: string;
    type: 'warning' | 'error' | 'success' | 'info';
}

// ─── Math CAPTCHA Component ──────────────────────────────────────────────────
const MathCaptcha = ({
    onVerify,
    className = '',
    maxNumber = 10,
    operators = ['+', '-'],
}: {
    onVerify: (isValid: boolean) => void;
    className?: string;
    maxNumber?: number;
    operators?: ('+' | '-' | '*')[];
}) => {
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [operator, setOperator] = useState('+');
    const [userAnswer, setUserAnswer] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState('');
    const [attempted, setAttempted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const hasGenerated = useRef(false);

    const generateChallenge = () => {
        const n1 = Math.floor(Math.random() * maxNumber) + 1;
        const n2 = Math.floor(Math.random() * maxNumber) + 1;
        const op = operators[Math.floor(Math.random() * operators.length)];

        setNum1(n1);
        setNum2(n2);
        setOperator(op);
        setUserAnswer('');
        setIsVerified(false);
        setError('');
        setAttempted(false);
        onVerify(false);

        setTimeout(() => inputRef.current?.focus(), 100);
    };

    // Only generate once per mount - ref guards against StrictMode double-invoke
    useEffect(() => {
        if (!hasGenerated.current) {
            hasGenerated.current = true;
            generateChallenge();
        }
    }, []);

    const handleVerify = () => {
        const trimmedAnswer = userAnswer.trim();

        if (trimmedAnswer === '') {
            setError('Please enter an answer');
            setIsVerified(false);
            onVerify(false);
            setAttempted(true);
            return;
        }

        const answer = parseInt(trimmedAnswer);
        if (isNaN(answer)) {
            setError('Please enter a valid number');
            setIsVerified(false);
            onVerify(false);
            setAttempted(true);
            return;
        }

        let correctAnswer;
        switch (operator) {
            case '+': correctAnswer = num1 + num2; break;
            case '-': correctAnswer = num1 - num2; break;
            case '*': correctAnswer = num1 * num2; break;
            default: correctAnswer = num1 + num2;
        }

        const isValid = answer === correctAnswer;
        setIsVerified(isValid);
        onVerify(isValid);
        setAttempted(true);

        if (!isValid) {
            setError('Incorrect answer. Please try again.');
        } else {
            setError('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleVerify();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUserAnswer(value);
        if (error) setError('');
        if (isVerified) {
            setIsVerified(false);
            onVerify(false);
        }
        setAttempted(false);
    };

    const getDisplay = () => `${num1} ${operator} ${num2} = ?`;

    return (
        <div className={`rounded-lg border p-4 ${className}`}>
            <div className="flex flex-col gap-3">
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Security Check
                    </label>
                    <div className="mt-1 flex items-center gap-3">
                        <div className="rounded-lg bg-gray-100 px-4 py-2 text-lg font-bold text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                            {getDisplay()}
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                hasGenerated.current = true;
                                generateChallenge();
                            }}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                            title="New challenge"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={userAnswer}
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                            isVerified
                                ? 'border-green-500 bg-green-50 focus:ring-green-500 dark:bg-green-900/20'
                                : attempted && !isVerified
                                ? 'border-red-500 bg-red-50 focus:ring-red-500 dark:bg-red-900/20'
                                : 'border-gray-300 focus:ring-red-500 dark:border-gray-700 dark:bg-gray-900'
                        }`}
                        placeholder="Enter your answer..."
                    />
                    <button
                        type="button"
                        onClick={handleVerify}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors whitespace-nowrap"
                    >
                        Verify
                    </button>
                </div>

                {isVerified && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                        ✓ Verified
                    </p>
                )}
                {error && !isVerified && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                        ✗ {error}
                    </p>
                )}
                {!isVerified && !error && attempted && userAnswer && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Click "Verify" to check your answer
                    </p>
                )}
            </div>
        </div>
    );
};

// ─── Drag-to-rank list ────────────────────────────────────────────────────────
const RankingBallot = ({
    rankedItems,
    onChange,
}: {
    ballot: Ballot;
    rankedItems: Option[];
    onChange: (ordered: Option[]) => void;
}) => {
    const dragIndex = useRef<number | null>(null);
    const dragOverIndex = useRef<number | null>(null);

    const touchStartY = useRef<number>(0);
    const touchDraggingIdx = useRef<number | null>(null);
    const [touchActiveIdx, setTouchActiveIdx] = useState<number | null>(null);

    const handleDragStart = (idx: number) => {
        dragIndex.current = idx;
    };

    const handleDragEnter = (idx: number) => {
        if (dragIndex.current === null || dragIndex.current === idx) return;
        dragOverIndex.current = idx;
        const updated = [...rankedItems];
        const [moved] = updated.splice(dragIndex.current, 1);
        updated.splice(idx, 0, moved);
        dragIndex.current = idx;
        onChange(updated);
    };

    const handleDragEnd = () => {
        dragIndex.current = null;
        dragOverIndex.current = null;
    };

    const handleTouchStart = (e: React.TouchEvent, idx: number) => {
        touchStartY.current = e.touches[0].clientY;
        touchDraggingIdx.current = idx;
        setTouchActiveIdx(idx);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchDraggingIdx.current === null) return;
        e.preventDefault();
        const y = e.touches[0].clientY;
        const diff = y - touchStartY.current;
        const steps = Math.round(diff / 72);
        if (steps === 0) return;
        const newIdx = Math.max(0, Math.min(rankedItems.length - 1, touchDraggingIdx.current + steps));
        if (newIdx !== touchDraggingIdx.current) {
            const updated = [...rankedItems];
            const [moved] = updated.splice(touchDraggingIdx.current, 1);
            updated.splice(newIdx, 0, moved);
            touchDraggingIdx.current = newIdx;
            touchStartY.current = y;
            setTouchActiveIdx(newIdx);
            onChange(updated);
        }
    };

    const handleTouchEnd = () => {
        touchDraggingIdx.current = null;
        setTouchActiveIdx(null);
    };

    return (
        <div className="space-y-2">
            <p className="mb-3 text-sm text-blue-600 dark:text-blue-400">
                Drag to reorder — top is your first choice
            </p>
            {rankedItems.map((option, idx) => (
                <div
                    key={option.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragEnter={() => handleDragEnter(idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    onTouchStart={(e) => handleTouchStart(e, idx)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-all select-none cursor-grab active:cursor-grabbing ${
                        touchActiveIdx === idx
                            ? 'border-red-400 bg-red-50 shadow-lg scale-[1.02] dark:bg-red-900/20'
                            : 'border-[#e3e3e0] bg-white hover:border-gray-300 hover:shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]'
                    }`}
                >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                        {idx + 1}
                    </div>
                    <GripVertical className="h-5 w-5 shrink-0 text-gray-300 dark:text-gray-600" />
                    {option.should_display_a_photo && option.photo_url && (
                        <img
                            src={option.photo_url}
                            alt={option.title}
                            className="h-10 w-10 shrink-0 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-[#1b1b18] dark:text-white">{option.title}</p>
                        {option.description && (
                            <p className="truncate text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Vertical step rail (left side, connected by a line) ─────────────────────
const StepRail = ({
    ballots,
    currentIndex,
    isBallotComplete,
    onSelect,
}: {
    ballots: Ballot[];
    currentIndex: number;
    isBallotComplete: (ballot: Ballot) => boolean;
    onSelect: (idx: number) => void;
}) => {
    const total = ballots.length;
    // Line fills up to the current step's circle center.
    const fillPercent = total > 1 ? (currentIndex / (total - 1)) * 100 : 0;

    return (
        <div className="relative pl-2">
            {/* base line */}
            <div
                className="absolute left-[23px] top-5 bottom-5 w-0.5 bg-gray-200 dark:bg-gray-700"
                aria-hidden
            />
            {/* animated fill line */}
            <div
                className="absolute left-[23px] top-5 w-0.5 bg-red-600 transition-all duration-500 ease-out"
                style={{ height: `calc((100% - 2.5rem) * ${fillPercent / 100})` }}
                aria-hidden
            />

            <ol className="relative space-y-6">
                {ballots.map((ballot, idx) => {
                    const complete = isBallotComplete(ballot);
                    const isActive = idx === currentIndex;
                    return (
                        <li key={ballot.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(idx)}
                                className="group flex w-full items-start gap-3 text-left"
                            >
                                <span
                                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ease-out ${
                                        complete
                                            ? 'bg-green-600 text-white'
                                            : isActive
                                            ? 'bg-red-600 text-white ring-4 ring-red-200 scale-110 dark:ring-red-900/40'
                                            : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:group-hover:bg-gray-600'
                                    }`}
                                >
                                    {complete ? (
                                        <CheckCircle className="h-4 w-4" />
                                    ) : (
                                        idx + 1
                                    )}
                                </span>
                                <span
                                    className={`mt-1.5 truncate text-sm font-medium transition-colors duration-300 ${
                                        isActive
                                            ? 'text-[#1b1b18] dark:text-white'
                                            : complete
                                            ? 'text-gray-600 dark:text-gray-400'
                                            : 'text-gray-400 dark:text-gray-500'
                                    }`}
                                >
                                    {ballot.title}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

// ─── Toast container (hoisted: stable identity across parent re-renders) ──────
const ToastContainer = ({
    toasts,
    onDismiss,
}: {
    toasts: Toast[];
    onDismiss: (id: number) => void;
}) => {
    if (toasts.length === 0) return null;
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg animate-in slide-in-from-top-2 fade-in duration-200 ${
                        toast.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500 dark:bg-yellow-900/30'
                        : toast.type === 'error'   ? 'bg-red-50 border-l-4 border-red-500 dark:bg-red-900/30'
                        : toast.type === 'success' ? 'bg-green-50 border-l-4 border-green-500 dark:bg-green-900/30'
                        : 'bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-900/30'
                    }`}
                >
                    {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />}
                    {toast.type === 'error'   && <AlertCircle   className="h-5 w-5 text-red-600 dark:text-red-400" />}
                    {toast.type === 'success' && <CheckCircle   className="h-5 w-5 text-green-600 dark:text-green-400" />}
                    {toast.type === 'info'    && <Info          className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                    <p className="text-sm text-gray-700 dark:text-gray-300">{toast.message}</p>
                    <button onClick={() => onDismiss(toast.id)} className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

// ─── Confirm modal (hoisted: stable identity, so MathCaptcha doesn't remount) ─
const ConfirmationModal = ({
    show,
    election,
    isBallotComplete,
    getBallotSummary,
    onClose,
    onEditBallot,
    captchaKey,
    captchaVerified,
    onCaptchaVerify,
    submitting,
    onSubmit,
}: {
    show: boolean;
    election: Election;
    isBallotComplete: (ballot: Ballot) => boolean;
    getBallotSummary: (ballot: Ballot) => string;
    onClose: () => void;
    onEditBallot: (idx: number) => void;
    captchaKey: number;
    captchaVerified: boolean;
    onCaptchaVerify: (isValid: boolean) => void;
    submitting: boolean;
    onSubmit: () => void;
}) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 max-w-2xl w-full rounded-2xl bg-white shadow-2xl dark:bg-[#161615] animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between border-b border-[#e3e3e0] p-6 dark:border-[#3E3E3A]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-white">Confirm Your Vote</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Please review your selections before submitting</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
                    {election.ballots.map((ballot, idx) => (
                        <div key={ballot.id} className="rounded-lg border border-[#e3e3e0] p-4 dark:border-[#3E3E3A]">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-500">#{idx + 1}</span>
                                        <h4 className="font-semibold text-[#1b1b18] dark:text-white">{ballot.title}</h4>
                                        {!isBallotComplete(ballot) && (
                                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">Incomplete</span>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500">Your answer:</p>
                                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{getBallotSummary(ballot)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onEditBallot(idx)}
                                    className="rounded-lg px-3 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* CAPTCHA Section */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <MathCaptcha
                            key={captchaKey}
                            onVerify={onCaptchaVerify}
                            maxNumber={10}
                            operators={['+', '-']}
                        />
                        {!captchaVerified && (
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                ⚠️ Please complete the security check to submit your vote
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex justify-end gap-3 border-t border-[#e3e3e0] p-6 dark:border-[#3E3E3A]">
                    <button onClick={onClose} className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={submitting || !captchaVerified}
                        className={`inline-flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors ${
                            submitting || !captchaVerified
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        {submitting ? (
                            <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Submitting...</>
                        ) : (
                            <><CheckCircle className="h-4 w-4" /> Confirm & Submit</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Review modal (hoisted: stable identity) ──────────────────────────────────
const ReviewModal = ({
    show,
    election,
    isBallotComplete,
    getBallotSummary,
    onClose,
}: {
    show: boolean;
    election: Election;
    isBallotComplete: (ballot: Ballot) => boolean;
    getBallotSummary: (ballot: Ballot) => string;
    onClose: () => void;
}) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 max-w-2xl w-full rounded-2xl bg-white shadow-2xl dark:bg-[#161615] animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between border-b border-[#e3e3e0] p-6 dark:border-[#3E3E3A]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <Eye className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-white">Review Your Votes</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">All your selections so far</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
                    {election.ballots.map((ballot, idx) => (
                        <div key={ballot.id} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/20">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-[#1b1b18] dark:text-white">{idx + 1}. {ballot.title}</h4>
                                {!isBallotComplete(ballot) && <span className="text-xs text-red-500">Incomplete</span>}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Your answer:</p>
                            <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">{getBallotSummary(ballot)}</p>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end border-t border-[#e3e3e0] p-6 dark:border-[#3E3E3A]">
                    <button onClick={onClose} className="rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function VoteHome({ election, voter, isPreview = false }: Props) {
    const [currentBallotIndex, setCurrentBallotIndex] = useState(0);
    const [votes, setVotes] = useState<Record<number, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [captchaKey, setCaptchaKey] = useState(0);

    const [rankings, setRankings] = useState<Record<number, Option[]>>({});
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    const [animKey, setAnimKey] = useState(0);

    const hasBallots = election.ballots && election.ballots.length > 0;
    const currentBallot = hasBallots ? election.ballots[currentBallotIndex] : null;
    const totalBallots = hasBallots ? election.ballots.length : 0;
    const isLastBallot = hasBallots ? currentBallotIndex === totalBallots - 1 : false;

    useEffect(() => {
        if (!currentBallot || currentBallot.type !== 'ranked_choice') return;
        if (!rankings[currentBallot.id]) {
            setRankings(prev => ({ ...prev, [currentBallot.id]: [...currentBallot.options] }));
        }
    }, [currentBallotIndex]);

    useEffect(() => {
        if (toasts.length > 0) {
            const timer = setTimeout(() => setToasts(prev => prev.slice(1)), 4000);
            return () => clearTimeout(timer);
        }
    }, [toasts]);

    const addToast = (message: string, type: Toast['type']) => {
        setToasts(prev => [...prev, { id: Date.now(), message, type }]);
    };

    const dismissToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const isBallotComplete = (ballot: Ballot): boolean => {
        switch (ballot.type) {
            case 'single_choice':
                return !!(votes[ballot.id] && votes[ballot.id].length > 0);
            case 'multiple_choice': {
                const sel = votes[ballot.id] || [];
                return sel.length >= ballot.min_selections && sel.length <= ballot.max_selections;
            }
            case 'ranked_choice':
                return !!(rankings[ballot.id] && rankings[ballot.id].length === ballot.options.length);
            case 'rating': {
                const rv = votes[ballot.id];
                return !!(rv && rv.optionId && rv.rating > 0);
            }
            case 'text': {
                const tv = votes[ballot.id];
                return !!(tv && tv.optionId && tv.response_text?.trim().length > 0);
            }
            default:
                return false;
        }
    };

    const handleOptionSelect = (ballotId: number, optionId: number) => {
        const ballot = election.ballots.find(b => b.id === ballotId);
        if (!ballot) return;

        if (ballot.type === 'single_choice') {
            setVotes({ ...votes, [ballotId]: [optionId] });
        } else if (ballot.type === 'multiple_choice') {
            const current = votes[ballotId] || [];
            if (current.includes(optionId)) {
                setVotes({ ...votes, [ballotId]: current.filter((id: number) => id !== optionId) });
            } else {
                if (current.length < ballot.max_selections) {
                    setVotes({ ...votes, [ballotId]: [...current, optionId] });
                } else {
                    addToast(`You can only select up to ${ballot.max_selections} option(s).`, 'warning');
                }
            }
        }
    };

    const isOptionSelected = (ballotId: number, optionId: number) =>
        (votes[ballotId] || []).includes(optionId);

    const handleNext = () => {
        if (!currentBallot) return;
        let isValid = false;

        switch (currentBallot.type) {
            case 'single_choice':
                isValid = !!(votes[currentBallot.id]?.length > 0);
                if (!isValid) addToast(`Please select an option for "${currentBallot.title}".`, 'warning');
                break;
            case 'multiple_choice': {
                const count = votes[currentBallot.id]?.length || 0;
                isValid = count >= currentBallot.min_selections && count <= currentBallot.max_selections;
                if (!isValid) addToast(
                    count < currentBallot.min_selections
                        ? `Please select at least ${currentBallot.min_selections} option(s).`
                        : `Max ${currentBallot.max_selections} option(s) allowed.`,
                    'warning'
                );
                break;
            }
            case 'ranked_choice':
                isValid = !!(rankings[currentBallot.id]?.length === currentBallot.options.length);
                if (!isValid) addToast(`Please rank all options for "${currentBallot.title}".`, 'warning');
                break;
            case 'rating': {
                const rv = votes[currentBallot.id];
                isValid = !!(rv?.optionId && rv.rating > 0);
                if (!isValid) addToast(`Please select an option and give a rating.`, 'warning');
                break;
            }
            case 'text': {
                const tv = votes[currentBallot.id];
                isValid = !!(tv?.optionId && tv.response_text?.trim().length > 0);
                if (!isValid) addToast(`Please select an option and write a response.`, 'warning');
                break;
            }
        }

        if (!isValid) return;

        if (isLastBallot) {
            if (isPreview) {
                addToast('You are in previewing mode. Voting is disabled.', 'info');
                return;
            }
            for (const ballot of election.ballots) {
                if (!isBallotComplete(ballot)) {
                    addToast(`Please complete: "${ballot.title}"`, 'warning');
                    setCurrentBallotIndex(election.ballots.findIndex(b => b.id === ballot.id));
                    return;
                }
            }
            setCaptchaVerified(false);
            setCaptchaKey(prev => prev + 1);
            setShowConfirmModal(true);
        } else {
            setDirection('forward');
            setAnimKey(k => k + 1);
            setCurrentBallotIndex(currentBallotIndex + 1);
        }
    };

    const handleBack = () => {
        if (currentBallotIndex > 0) {
            setDirection('backward');
            setAnimKey(k => k + 1);
            setCurrentBallotIndex(currentBallotIndex - 1);
        }
    };

    const goToBallot = (idx: number) => {
        if (idx === currentBallotIndex) return;
        setDirection(idx > currentBallotIndex ? 'forward' : 'backward');
        setAnimKey(k => k + 1);
        setCurrentBallotIndex(idx);
    };

    const handleSubmit = () => {
        if (!captchaVerified) {
            addToast('Please complete the security check.', 'warning');
            return;
        }

        setSubmitting(true);
        setShowConfirmModal(false);

        const voteData = {
            votes: election.ballots.map(ballot => {
                let answer: any;
                switch (ballot.type) {
                    case 'single_choice':
                    case 'multiple_choice':
                        answer = { option_ids: votes[ballot.id] || [] };
                        break;
                    case 'ranked_choice':
                        answer = {
                            rankings: (rankings[ballot.id] || []).map((opt, idx) => ({
                                optionId: opt.id,
                                rank: idx + 1,
                            })),
                        };
                        break;
                    case 'rating':
                        answer = { option_id: votes[ballot.id]?.optionId, rating: votes[ballot.id]?.rating };
                        break;
                    case 'text':
                        answer = { option_id: votes[ballot.id]?.optionId, response_text: votes[ballot.id]?.response_text };
                        break;
                    default:
                        answer = { option_ids: [] };
                }
                return { ballot_id: ballot.id, type: ballot.type, ...answer };
            }),
            captcha_verified: captchaVerified,
        };

        console.log('Submitting votes:', voteData);

        router.post(`/vote/${election.identifier}/submit`, voteData, {
            onError: (errors) => {
                setSubmitting(false);
                if (errors.captcha) {
                    addToast('Security verification failed. Please try again.', 'error');
                    setCaptchaVerified(false);
                } else {
                    addToast('Error submitting your vote. Please try again.', 'error');
                }
            },
            onSuccess: () => {
                setSubmitting(false);
                addToast('Your vote has been submitted successfully!', 'success');
            },
        });
    };

    const getSelectedOptionText = (ballotId: number, optionId: number) => {
        const ballot = election.ballots.find(b => b.id === ballotId);
        return ballot?.options.find(o => o.id === optionId)?.title || 'Unknown';
    };

    const getBallotSummary = (ballot: Ballot) => {
        switch (ballot.type) {
            case 'single_choice':
            case 'multiple_choice': {
                const sel = votes[ballot.id] || [];
                return sel.length === 0 ? 'Not answered' : sel.map((id: number) => getSelectedOptionText(ballot.id, id)).join(', ');
            }
            case 'ranked_choice': {
                const ranked = rankings[ballot.id] || [];
                return ranked.length === 0 ? 'Not ranked' : ranked.map((o, i) => `${i + 1}. ${o.title}`).join(', ');
            }
            case 'rating': {
                const rv = votes[ballot.id];
                if (!rv?.optionId) return 'Not answered';
                return `${getSelectedOptionText(ballot.id, rv.optionId)} — ${rv.rating}/${ballot.max_selections} stars`;
            }
            case 'text': {
                const tv = votes[ballot.id];
                if (!tv?.optionId) return 'Not answered';
                const preview = tv.response_text?.length > 50 ? tv.response_text.substring(0, 50) + '...' : tv.response_text;
                return `${getSelectedOptionText(ballot.id, tv.optionId)}: "${preview}"`;
            }
            default:
                return 'Not answered';
        }
    };

    const renderBallotContent = () => {
        if (!currentBallot) return null;

        switch (currentBallot.type) {
            case 'single_choice':
            case 'multiple_choice':
                return (
                    <div className="space-y-3">
                        {currentBallot.options.map((option) => (
                            <label
                                key={option.id}
                                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                                    isOptionSelected(currentBallot.id, option.id)
                                        ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                                        : 'border-[#e3e3e0] hover:border-red-300 dark:border-[#3E3E3A]'
                                }`}
                            >
                                <input
                                    type={currentBallot.type === 'single_choice' ? 'radio' : 'checkbox'}
                                    name={`ballot_${currentBallot.id}`}
                                    checked={isOptionSelected(currentBallot.id, option.id)}
                                    onChange={() => handleOptionSelect(currentBallot.id, option.id)}
                                    className="mt-1 h-4 w-4 text-red-600 focus:ring-red-600"
                                />
                                {option.should_display_a_photo && option.photo_url && (
                                    <img
                                        src={option.photo_url}
                                        alt={option.title}
                                        className="h-12 w-12 flex-shrink-0 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                    />
                                )}
                                <div className="flex-1">
                                    <div className="font-medium text-[#1b1b18] dark:text-white">{option.title}</div>
                                    {option.description && (
                                        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                );

            case 'ranked_choice': {
                const ordered = rankings[currentBallot.id] || currentBallot.options;
                return (
                    <RankingBallot
                        ballot={currentBallot}
                        rankedItems={ordered}
                        onChange={(updated) => setRankings(prev => ({ ...prev, [currentBallot.id]: updated }))}
                    />
                );
            }

            case 'rating': {
                const currentRatingVote = votes[currentBallot.id] || {};
                return (
                    <div className="space-y-3">
                        <p className="mb-3 text-sm text-blue-600 dark:text-blue-400">
                            Select an option and rate it from 1 to {currentBallot.max_selections} stars
                        </p>
                        {currentBallot.options.map((option) => {
                            const isSelected = currentRatingVote.optionId === option.id;
                            return (
                                <div
                                    key={option.id}
                                    className={`rounded-lg border p-4 transition-all ${
                                        isSelected
                                            ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                                            : 'border-[#e3e3e0] hover:border-red-300 dark:border-[#3E3E3A]'
                                    }`}
                                >
                                    <label className="flex cursor-pointer items-center gap-3">
                                        <input
                                            type="radio"
                                            name={`ballot_${currentBallot.id}`}
                                            checked={isSelected}
                                            onChange={() =>
                                                setVotes({
                                                    ...votes,
                                                    [currentBallot.id]: {
                                                        optionId: option.id,
                                                        rating: currentRatingVote.optionId === option.id ? currentRatingVote.rating : 0,
                                                    },
                                                })
                                            }
                                            className="h-4 w-4 text-red-600 focus:ring-red-600"
                                        />
                                        {option.should_display_a_photo && option.photo_url && (
                                            <img src={option.photo_url} alt={option.title} className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium text-[#1b1b18] dark:text-white">{option.title}</p>
                                            {option.description && <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>}
                                        </div>
                                    </label>

                                    {isSelected && (
                                        <div className="mt-3 border-t border-[#e3e3e0] pt-3 dark:border-[#3E3E3A]">
                                            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Your rating:</p>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: currentBallot.max_selections }, (_, i) => i + 1).map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() =>
                                                            setVotes({ ...votes, [currentBallot.id]: { optionId: option.id, rating: star } })
                                                        }
                                                        className="transition-transform hover:scale-110"
                                                    >
                                                        <Star
                                                            className={`h-7 w-7 ${
                                                                star <= (currentRatingVote.rating || 0)
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-300 dark:text-gray-600'
                                                            }`}
                                                        />
                                                    </button>
                                                ))}
                                                {currentRatingVote.rating > 0 && (
                                                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                                        {currentRatingVote.rating}/{currentBallot.max_selections}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            }

            case 'text': {
                const currentTextVote = votes[currentBallot.id] || {};
                return (
                    <div className="space-y-3">
                        <p className="mb-3 text-sm text-blue-600 dark:text-blue-400">
                            Select an option and write your response
                        </p>
                        {currentBallot.options.map((option) => {
                            const isSelected = currentTextVote.optionId === option.id;
                            return (
                                <div
                                    key={option.id}
                                    className={`rounded-lg border p-4 transition-all ${
                                        isSelected
                                            ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                                            : 'border-[#e3e3e0] hover:border-red-300 dark:border-[#3E3E3A]'
                                    }`}
                                >
                                    <label className="flex cursor-pointer items-center gap-3">
                                        <input
                                            type="radio"
                                            name={`ballot_${currentBallot.id}`}
                                            checked={isSelected}
                                            onChange={() =>
                                                setVotes({
                                                    ...votes,
                                                    [currentBallot.id]: {
                                                        optionId: option.id,
                                                        response_text: currentTextVote.optionId === option.id ? currentTextVote.response_text : '',
                                                    },
                                                })
                                            }
                                            className="h-4 w-4 text-red-600 focus:ring-red-600"
                                        />
                                        {option.should_display_a_photo && option.photo_url && (
                                            <img src={option.photo_url} alt={option.title} className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium text-[#1b1b18] dark:text-white">{option.title}</p>
                                            {option.description && <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>}
                                        </div>
                                    </label>

                                    {isSelected && (
                                        <div className="mt-3 border-t border-[#e3e3e0] pt-3 dark:border-[#3E3E3A]">
                                            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Your response:</p>
                                            <textarea
                                                value={currentTextVote.response_text || ''}
                                                onChange={(e) =>
                                                    setVotes({ ...votes, [currentBallot.id]: { optionId: option.id, response_text: e.target.value } })
                                                }
                                                rows={4}
                                                autoFocus
                                                className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                placeholder="Type your response here..."
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            }

            default:
                return null;
        }
    };

    if (!hasBallots) {
        return (
            <>
                <Head title={`Vote - ${election.title}`} />
                <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] via-white to-red-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-red-950/20 flex items-center justify-center p-4">
                    <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-[#161615]">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                            <Vote className="h-8 w-8 text-yellow-600" />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-[#1b1b18] dark:text-white">{election.title}</h2>
                        <p className="mb-6 text-gray-600 dark:text-gray-400">This election has no ballots configured yet.</p>
                        <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700">Return to Home</Link>
                    </div>
                </div>
            </>
        );
    }

    // Calculate if all ballots are complete
    const allBallotsComplete = election.ballots.every(b => isBallotComplete(b));

    return (
        <>
            <Head title={`Vote - ${election.title}`} />

            <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] via-white to-red-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-red-950/20">
                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

                    {/* Welcome bar */}
                    <div className="mb-6 flex items-center justify-between rounded-lg bg-white/50 p-4 backdrop-blur-sm dark:bg-[#161615]/50">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-[#1b1b18] dark:text-white">{election.title}</h1>
                                {isPreview && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                        <Eye className="h-3 w-3" /> Preview Mode
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Welcome, <span className="font-semibold text-red-600">{voter.name || voter.email}</span>
                            </p>
                        </div>
                        {allBallotsComplete && (
                            <button
                                onClick={() => setShowReviewModal(true)}
                                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            >
                                <Eye className="h-3 w-3" /> Review All
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-[180px_1fr] lg:gap-10">
                        {/* Step rail */}
                        <div className="hidden sm:block">
                            <div className="sticky top-8 rounded-2xl bg-white/50 p-4 backdrop-blur-sm dark:bg-[#161615]/50">
                                <StepRail
                                    ballots={election.ballots}
                                    currentIndex={currentBallotIndex}
                                    isBallotComplete={isBallotComplete}
                                    onSelect={goToBallot}
                                />
                            </div>
                        </div>

                        {/* Mobile: compact horizontal version of the same rail */}
                        <div className="sm:hidden">
                            <div className="flex items-center gap-2 overflow-x-auto rounded-2xl bg-white/50 p-3 backdrop-blur-sm dark:bg-[#161615]/50">
                                {election.ballots.map((ballot, idx) => {
                                    const complete = isBallotComplete(ballot);
                                    const isActive = idx === currentBallotIndex;
                                    return (
                                        <button
                                            key={ballot.id}
                                            onClick={() => goToBallot(idx)}
                                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                                                complete
                                                    ? 'bg-green-600 text-white'
                                                    : isActive
                                                    ? 'bg-red-600 text-white ring-4 ring-red-200 scale-110 dark:ring-red-900/40'
                                                    : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                            }`}
                                        >
                                            {complete ? <CheckCircle className="h-3.5 w-3.5" /> : idx + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Ballot card */}
                        <div className="overflow-hidden">
                            <div
                                key={animKey}
                                className={`rounded-2xl bg-white p-6 shadow-xl dark:bg-[#161615] ${
                                    direction === 'forward'
                                        ? 'animate-in fade-in slide-in-from-right-6 duration-300 ease-out'
                                        : 'animate-in fade-in slide-in-from-left-6 duration-300 ease-out'
                                }`}
                            >
                                <div className="mb-6">
                                    <div className="mb-2 flex items-center gap-2">
                                        {currentBallot.type === 'single_choice'   && <CheckCircle className="h-5 w-5 text-blue-600" />}
                                        {currentBallot.type === 'multiple_choice' && <CheckCircle className="h-5 w-5 text-green-600" />}
                                        {currentBallot.type === 'ranked_choice'   && <List  className="h-5 w-5 text-purple-600" />}
                                        {currentBallot.type === 'rating'          && <Star  className="h-5 w-5 text-yellow-600" />}
                                        {currentBallot.type === 'text'            && <Type  className="h-5 w-5 text-indigo-600" />}
                                        <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-white">{currentBallot.title}</h2>
                                    </div>
                                    {currentBallot.description && (
                                        <p className="mt-2 text-gray-600 dark:text-gray-400">{currentBallot.description}</p>
                                    )}
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                            {currentBallot.type.replace(/_/g, ' ')}
                                        </span>
                                        {currentBallot.type === 'multiple_choice' && (
                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                Select {currentBallot.min_selections}–{currentBallot.max_selections}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {renderBallotContent()}

                                <div className="mt-6 flex justify-between gap-4">
                                    <button
                                        onClick={handleBack}
                                        disabled={currentBallotIndex === 0}
                                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                            currentBallotIndex === 0
                                                ? 'cursor-not-allowed opacity-50'
                                                : 'border border-[#e3e3e0] text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <ChevronLeft className="h-4 w-4" /> Back
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={submitting}
                                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white transition-transform hover:bg-red-700 active:scale-95 disabled:opacity-50"
                                    >
                                        {isLastBallot
                                            ? (isPreview ? 'Submit (disabled in preview)' : (submitting ? 'Submitting...' : 'Review & Submit'))
                                            : 'Next'}
                                        {!isLastBallot && <ChevronRight className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer toasts={toasts} onDismiss={dismissToast} />

            <ConfirmationModal
                show={showConfirmModal}
                election={election}
                isBallotComplete={isBallotComplete}
                getBallotSummary={getBallotSummary}
                onClose={() => setShowConfirmModal(false)}
                onEditBallot={(idx) => { setShowConfirmModal(false); goToBallot(idx); }}
                captchaKey={captchaKey}
                captchaVerified={captchaVerified}
                onCaptchaVerify={setCaptchaVerified}
                submitting={submitting}
                onSubmit={handleSubmit}
            />

            <ReviewModal
                show={showReviewModal}
                election={election}
                isBallotComplete={isBallotComplete}
                getBallotSummary={getBallotSummary}
                onClose={() => setShowReviewModal(false)}
            />
        </>
    );
}