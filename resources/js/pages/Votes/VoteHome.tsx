import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight, Vote, AlertTriangle, X, Eye, Info, AlertCircle, Star, List, Type, GripVertical } from 'lucide-react';

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
}

interface Toast {
    id: number;
    message: string;
    type: 'warning' | 'error' | 'success' | 'info';
}

interface RankedVote {
    optionId: number;
    rank: number;
}

// ─── Drag-to-rank list ────────────────────────────────────────────────────────
function RankingBallot({
    ballot,
    rankedItems,
    onChange,
}: {
    ballot: Ballot;
    rankedItems: Option[];        // ordered list (index 0 = rank 1)
    onChange: (ordered: Option[]) => void;
}) {
    const dragIndex = useRef<number | null>(null);
    const dragOverIndex = useRef<number | null>(null);

    // Touch drag state
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

    // Touch handlers for mobile
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
        // Each item is roughly 72px tall
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
                    {/* Rank badge */}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                        {idx + 1}
                    </div>

                    {/* Grip handle */}
                    <GripVertical className="h-5 w-5 shrink-0 text-gray-300 dark:text-gray-600" />

                    {/* Photo */}
                    {option.should_display_a_photo && option.photo_url && (
                        <img
                            src={option.photo_url}
                            alt={option.title}
                            className="h-10 w-10 shrink-0 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                        />
                    )}

                    {/* Text */}
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
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VoteHome({ election, voter }: Props) {
    const [currentBallotIndex, setCurrentBallotIndex] = useState(0);
    const [votes, setVotes] = useState<Record<number, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);

    // ranked_choice: keyed by ballotId → ordered Option[]
    const [rankings, setRankings] = useState<Record<number, Option[]>>({});

    const hasBallots = election.ballots && election.ballots.length > 0;
    const currentBallot = hasBallots ? election.ballots[currentBallotIndex] : null;
    const totalBallots = hasBallots ? election.ballots.length : 0;
    const isLastBallot = hasBallots ? currentBallotIndex === totalBallots - 1 : false;

    // Initialise ranking lists when ballot changes
    useEffect(() => {
        if (!currentBallot || currentBallot.type !== 'ranked_choice') return;
        if (!rankings[currentBallot.id]) {
            setRankings(prev => ({ ...prev, [currentBallot.id]: [...currentBallot.options] }));
        }
    }, [currentBallotIndex]);

    // Auto-dismiss toasts
    useEffect(() => {
        if (toasts.length > 0) {
            const timer = setTimeout(() => setToasts(prev => prev.slice(1)), 4000);
            return () => clearTimeout(timer);
        }
    }, [toasts]);

    const addToast = (message: string, type: Toast['type']) => {
        setToasts(prev => [...prev, { id: Date.now(), message, type }]);
    };

    const isBallotComplete = (ballot: Ballot): boolean => {
        switch (ballot.type) {
            case 'single_choice':
                return !!(votes[ballot.id] && votes[ballot.id].length > 0);
            case 'multiple_choice':
                const sel = votes[ballot.id] || [];
                return sel.length >= ballot.min_selections && sel.length <= ballot.max_selections;
            case 'ranked_choice':
                // Always complete once initialised — voter just reorders
                return !!(rankings[ballot.id] && rankings[ballot.id].length === ballot.options.length);
            case 'rating':
                const rv = votes[ballot.id];
                return !!(rv && rv.optionId && rv.rating > 0);
            case 'text':
                const tv = votes[ballot.id];
                return !!(tv && tv.optionId && tv.response_text?.trim().length > 0);
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
            case 'multiple_choice':
                const count = votes[currentBallot.id]?.length || 0;
                isValid = count >= currentBallot.min_selections && count <= currentBallot.max_selections;
                if (!isValid) addToast(
                    count < currentBallot.min_selections
                        ? `Please select at least ${currentBallot.min_selections} option(s).`
                        : `Max ${currentBallot.max_selections} option(s) allowed.`,
                    'warning'
                );
                break;
            case 'ranked_choice':
                isValid = !!(rankings[currentBallot.id]?.length === currentBallot.options.length);
                if (!isValid) addToast(`Please rank all options for "${currentBallot.title}".`, 'warning');
                break;
            case 'rating':
                const rv = votes[currentBallot.id];
                isValid = !!(rv?.optionId && rv.rating > 0);
                if (!isValid) addToast(`Please select an option and give a rating.`, 'warning');
                break;
            case 'text':
                const tv = votes[currentBallot.id];
                isValid = !!(tv?.optionId && tv.response_text?.trim().length > 0);
                if (!isValid) addToast(`Please select an option and write a response.`, 'warning');
                break;
        }

        if (!isValid) return;

        if (isLastBallot) {
            for (const ballot of election.ballots) {
                if (!isBallotComplete(ballot)) {
                    addToast(`Please complete: "${ballot.title}"`, 'warning');
                    setCurrentBallotIndex(election.ballots.findIndex(b => b.id === ballot.id));
                    return;
                }
            }
            setShowConfirmModal(true);
        } else {
            setCurrentBallotIndex(currentBallotIndex + 1);
        }
    };

    const handleBack = () => {
        if (currentBallotIndex > 0) setCurrentBallotIndex(currentBallotIndex - 1);
    };

    const handleSubmit = () => {
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
        };
  console.log('Submitting votes:', voteData),
        router.post(`/vote/${election.identifier}/submit`, voteData, {

            onError: () => {
                setSubmitting(false);
                addToast('Error submitting your vote. Please try again.', 'error');
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
            case 'multiple_choice':
                const sel = votes[ballot.id] || [];
                return sel.length === 0 ? 'Not answered' : sel.map((id: number) => getSelectedOptionText(ballot.id, id)).join(', ');
            case 'ranked_choice':
                const ranked = rankings[ballot.id] || [];
                return ranked.length === 0 ? 'Not ranked' : ranked.map((o, i) => `${i + 1}. ${o.title}`).join(', ');
            case 'rating':
                const rv = votes[ballot.id];
                if (!rv?.optionId) return 'Not answered';
                return `${getSelectedOptionText(ballot.id, rv.optionId)} — ${rv.rating}/${ballot.max_selections} stars`;
            case 'text':
                const tv = votes[ballot.id];
                if (!tv?.optionId) return 'Not answered';
                const preview = tv.response_text?.length > 50 ? tv.response_text.substring(0, 50) + '...' : tv.response_text;
                return `${getSelectedOptionText(ballot.id, tv.optionId)}: "${preview}"`;
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

    // ── Toast ──
    const ToastContainer = () => {
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
                        <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    // ── Confirm modal ──
    const ConfirmationModal = () => {
        if (!showConfirmModal) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
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
                        <button onClick={() => setShowConfirmModal(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800">
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
                                        onClick={() => { setShowConfirmModal(false); setCurrentBallotIndex(idx); }}
                                        className="rounded-lg px-3 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 border-t border-[#e3e3e0] p-6 dark:border-[#3E3E3A]">
                        <button onClick={() => setShowConfirmModal(false)} className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
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

    // ── Review modal ──
    const ReviewModal = () => {
        if (!showReviewModal) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReviewModal(false)} />
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
                        <button onClick={() => setShowReviewModal(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800">
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
                        <button onClick={() => setShowReviewModal(false)} className="rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
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

    const isComplete = election.ballots.every(b => isBallotComplete(b));

    return (
        <>
            <Head title={`Vote - ${election.title}`} />

            <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] via-white to-red-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-red-950/20">
                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">

                    {/* Welcome bar */}
                    <div className="mb-6 rounded-lg bg-white/50 p-4 backdrop-blur-sm dark:bg-[#161615]/50">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Welcome, <span className="font-semibold text-red-600">{voter.name || voter.email}</span>
                            </p>
                            {isComplete && (
                                <button
                                    onClick={() => setShowReviewModal(true)}
                                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                >
                                    <Eye className="h-3 w-3" /> Review All
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-8">
                        <div className="mb-2 flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-[#1b1b18] dark:text-white">{election.title}</h1>
                            <span className="text-sm text-gray-500">Question {currentBallotIndex + 1} of {totalBallots}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                                className="h-full rounded-full bg-red-600 transition-all duration-300"
                                style={{ width: `${((currentBallotIndex + 1) / totalBallots) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Ballot card */}
                    <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-[#161615]">
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
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {isLastBallot ? (submitting ? 'Submitting...' : 'Review & Submit') : 'Next'}
                                {!isLastBallot && <ChevronRight className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Question dots */}
                    <div className="mt-6 rounded-lg bg-white/50 p-4 backdrop-blur-sm dark:bg-[#161615]/50">
                        <h3 className="mb-2 text-sm font-medium text-[#1b1b18] dark:text-white">Questions Progress</h3>
                        <div className="flex flex-wrap gap-2">
                            {election.ballots.map((ballot, idx) => (
                                <button
                                    key={ballot.id}
                                    onClick={() => setCurrentBallotIndex(idx)}
                                    className={`rounded-full px-3 py-1 text-xs transition-all ${
                                        isBallotComplete(ballot)
                                            ? 'bg-green-600 text-white'
                                            : idx === currentBallotIndex
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                    }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer />
            <ConfirmationModal />
            <ReviewModal />
        </>
    );
}