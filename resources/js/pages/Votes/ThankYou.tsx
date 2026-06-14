import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Home } from 'lucide-react';

interface Props {
    electionIdentifier: string;
}

export default function ThankYou({ electionIdentifier }: Props) {
    return (
        <>
            <Head title="Thank You for Voting" />

            <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] via-white to-red-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-red-950/20 flex items-center justify-center p-4">
                <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-[#161615]">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-[#1b1b18] dark:text-white">Thank You!</h2>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Your vote has been successfully recorded.
                        <br />
                        Thank you for participating in this election.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700"
                    >
                        <Home className="h-4 w-4" />
                        Return to Home
                    </Link>
                </div>
            </div>
        </>
    );
}