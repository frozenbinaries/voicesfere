import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { KeyRound, ArrowRight, AlertCircle, Vote } from 'lucide-react';

interface Props {
    election: {
        id: number;
        title: string;
        description: string | null;
        identifier: string;
    };
    error?: string;
}

export default function VoterKeyLogin({ election, error }: Props) {
    const [voterKey, setVoterKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState(error || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!voterKey.trim()) {
            setLocalError('Please enter your Voter Key');
            return;
        }

        setLoading(true);
        setLocalError('');

        router.post(`/vote/${election.identifier}/authenticate`, {
            voter_key: voterKey
        }, {
            onError: (errors) => {
                setLocalError(errors.voter_key || 'Invalid Voter Key. Please try again.');
                setLoading(false);
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    return (
        <>
            <Head title={`Voter Authentication - ${election.title}`} />

            <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] via-white to-red-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-red-950/20 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    {/* Back Button */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 mb-6 transition-colors"
                    >
                        ← Back to Home
                    </Link>

                    {/* Card */}
                    <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-[#161615]">
                        {/* Election Info */}
                        <div className="mb-6 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                <Vote className="h-8 w-8 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-[#1b1b18] dark:text-white">
                                {election.title}
                            </h1>
                            {election.description && (
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    {election.description}
                                </p>
                            )}
                        </div>

                        {/* Error Message */}
                        {localError && (
                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{localError}</span>
                            </div>
                        )}

                        {/* Voter Key Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-white">
                                    Voter Key
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <KeyRound className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={voterKey}
                                        onChange={(e) => setVoterKey(e.target.value)}
                                        placeholder="Enter your unique voter key"
                                        className="w-full rounded-lg border border-[#e3e3e0] py-2 pl-10 pr-4 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                        autoFocus
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Enter the voter key you received via email or SMS
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-red-600 py-2.5 font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Continue to Vote
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Help Text */}
                        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                            <p>Don't have a voter key?</p>
                            <p className="mt-1">Contact the election administrator for assistance.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}