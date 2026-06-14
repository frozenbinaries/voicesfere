import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle, ChevronLeft, AlertCircle } from 'lucide-react';

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

interface Props {
    election: Election;
}

export default function Vote({ election }: Props) {
    const [currentBallotIndex, setCurrentBallotIndex] = useState(0);
    const [votes, setVotes] = useState<Record<number, number[]>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Check if there are ballots
    const hasBallots = election.ballots && election.ballots.length > 0;

    // Get current ballot safely
    const currentBallot = hasBallots ? election.ballots[currentBallotIndex] : null;
    const totalBallots = hasBallots ? election.ballots.length : 0;
    const isLastBallot = hasBallots ? currentBallotIndex === totalBallots - 1 : false;

    // If no ballots, show error message
    if (!hasBallots) {
        return (
            <>
                <Head title={`Vote - ${election.title}`} />
                <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] via-white to-red-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-red-950/20 flex items-center justify-center p-4">
                    <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-[#161615]">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                            <AlertCircle className="h-8 w-8 text-yellow-600" />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-[#1b1b18] dark:text-white">
                            {election.title}
                        </h2>
                        <p className="mb-6 text-gray-600 dark:text-gray-400">
                            This election has no ballots configured yet.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700"
                        >
                            Return to Home
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const handleOptionSelect = (ballotId: number, optionId: number) => {
        const currentVotes = votes[ballotId] || [];
        const ballot = election.ballots.find(b => b.id === ballotId);

        if (!ballot) return;

        if (ballot.type === 'single_choice') {
            // Single choice - replace with just this option
            setVotes({ ...votes, [ballotId]: [optionId] });
        } else if (ballot.type === 'multiple_choice') {
            // Multiple choice - toggle the option
            let newVotes;
            if (currentVotes.includes(optionId)) {
                newVotes = currentVotes.filter(id => id !== optionId);
            } else {
                if (currentVotes.length < ballot.max_selections) {
                    newVotes = [...currentVotes, optionId];
                } else {
                    return; // Max selections reached
                }
            }
            setVotes({ ...votes, [ballotId]: newVotes });
        }
    };

    const isOptionSelected = (ballotId: number, optionId: number) => {
        return (votes[ballotId] || []).includes(optionId);
    };

    const handleNext = () => {
        if (!currentBallot) return;

        if (!votes[currentBallot.id] || votes[currentBallot.id].length === 0) {
            alert('Please select an option before continuing.');
            return;
        }

        if (currentBallot.type === 'multiple_choice') {
            const selectedCount = votes[currentBallot.id]?.length || 0;
            if (selectedCount < currentBallot.min_selections) {
                alert(`Please select at least ${currentBallot.min_selections} option(s).`);
                return;
            }
        }

        if (isLastBallot) {
            handleSubmit();
        } else {
            setCurrentBallotIndex(currentBallotIndex + 1);
        }
    };

    const handleBack = () => {
        if (currentBallotIndex > 0) {
            setCurrentBallotIndex(currentBallotIndex - 1);
        }
    };

    const handleSubmit = () => {
        if (!currentBallot) return;

        // Check all ballots have votes
        for (const ballot of election.ballots) {
            if (!votes[ballot.id] || votes[ballot.id].length === 0) {
                alert(`Please complete all questions before submitting.`);
                return;
            }

            if (ballot.type === 'multiple_choice') {
                const selectedCount = votes[ballot.id]?.length || 0;
                if (selectedCount < ballot.min_selections) {
                    alert(`Please select at least ${ballot.min_selections} option(s) for: ${ballot.title}`);
                    return;
                }
            }
        }

        setSubmitting(true);

        // Prepare vote data
        const voteData = {
            votes: election.ballots.map(ballot => ({
                ballot_id: ballot.id,
                option_ids: votes[ballot.id] || []
            }))
        };

        router.post(`/vote/${election.identifier}/submit`, voteData, {
            onSuccess: () => {
                setSubmitting(false);
                setSubmitted(true);
            },
            onError: (errors) => {
                setSubmitting(false);
                alert('There was an error submitting your vote. Please try again.');
            }
        });
    };

    if (submitted) {
        return (
            <>
                <Head title={`Thank You - ${election.title}`} />
                <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] via-white to-red-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-red-950/20 flex items-center justify-center p-4">
                    <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-[#161615]">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-[#1b1b18] dark:text-white">Thank You!</h2>
                        <p className="mb-6 text-gray-600 dark:text-gray-400">
                            Your vote has been successfully cast.
                        </p>
                        <Link
                            href="/"
                            className="inline-block rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700"
                        >
                            Return to Home
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Vote - ${election.title}`} />

            <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] via-white to-red-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-red-950/20">
                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Progress Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-2xl font-bold text-[#1b1b18] dark:text-white">{election.title}</h1>
                            <span className="text-sm text-gray-500">
                                Question {currentBallotIndex + 1} of {totalBallots}
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                                className="h-full rounded-full bg-red-600 transition-all duration-300"
                                style={{ width: `${((currentBallotIndex + 1) / totalBallots) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Ballot Question Card */}
                    <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-[#161615]">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-white">
                                {currentBallot.title}
                            </h2>
                            {currentBallot.description && (
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {currentBallot.description}
                                </p>
                            )}
                            {currentBallot.type === 'multiple_choice' && (
                                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                                    Select {currentBallot.min_selections} - {currentBallot.max_selections} option(s)
                                </p>
                            )}
                            {currentBallot.type === 'single_choice' && (
                                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                                    Select one option
                                </p>
                            )}
                        </div>

                        {/* Options */}
                        <div className="space-y-3">
                            {currentBallot.options && currentBallot.options.length > 0 ? (
                                currentBallot.options.map((option) => (
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
                                        <div className="flex-1">
                                            <div className="font-medium text-[#1b1b18] dark:text-white">
                                                {option.title}
                                            </div>
                                            {option.description && (
                                                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                    {option.description}
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                ))
                            ) : (
                                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center dark:border-yellow-800 dark:bg-yellow-900/20">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                                        No options available for this question.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Navigation Buttons */}
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
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={submitting || !currentBallot.options?.length}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
                            >
                                {isLastBallot ? (submitting ? 'Submitting...' : 'Submit Vote') : 'Next'}
                                {!isLastBallot && <ChevronLeft className="h-4 w-4 rotate-180" />}
                            </button>
                        </div>
                    </div>

                    {/* Summary of answers */}
                    <div className="mt-6 rounded-lg bg-white/50 p-4 backdrop-blur-sm dark:bg-[#161615]/50">
                        <h3 className="mb-2 text-sm font-medium text-[#1b1b18] dark:text-white">Your Progress</h3>
                        <div className="flex flex-wrap gap-2">
                            {election.ballots.map((ballot, idx) => (
                                <button
                                    key={ballot.id}
                                    onClick={() => setCurrentBallotIndex(idx)}
                                    className={`rounded-full px-3 py-1 text-xs transition-all ${
                                        votes[ballot.id] && votes[ballot.id].length > 0
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
        </>
    );
}