import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle,
    FileText,
    Users,
    Settings,
    Rocket,
    ArrowLeft,
    ExternalLink,
    Copy,
    Check,
    HelpCircle,
    MessageCircle,
    Calendar,
    Globe,
    EyeOff,
    Plus,
    Trash2,
    Edit,
    Menu,
    X,
    Sun,
    Moon,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface HelpSection {
    id: string;
    title: string;
    description: string;
    icon: any;
    steps: string[];
    tips?: string[];
    relatedLinks?: { title: string; href: string }[];
}

export default function HelpIndex() {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Initialize theme based on device preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            setTheme(savedTheme);
            applyTheme(savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const defaultTheme = prefersDark ? 'dark' : 'light';
            setTheme(defaultTheme);
            applyTheme(defaultTheme);
        }
    }, []);

    const applyTheme = (newTheme: 'light' | 'dark') => {
        const root = document.documentElement;
        if (newTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', newTheme);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
    };

    useEffect(() => {
        const handleScroll = () => {
            const sections = helpSections.map(s => s.id);
            for (const section of sections.reverse()) {
                const element = document.getElementById(section);
                if (element && window.scrollY >= element.offsetTop - 100) {
                    setActiveSection(section);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const helpSections: HelpSection[] = [
        {
            id: 'no-ballots',
            title: 'No Ballots Added',
            description: 'Your election has no ballot questions. Voters need questions to answer.',
            icon: FileText,
            steps: [
                'Go to the Ballots tab in your election',
                'Click the "+ Add Question" button',
                'Select a ballot type (Single Choice, Multiple Choice, etc.)',
                'Enter a title and description for your question',
                'Add options/candidates for voters to choose from',
                'Configure settings like max/min selections',
                'Click "Create Ballot" to save',
            ],
            tips: [
                'Ballots can be rearranged by changing the display order',
                'Each ballot can have different settings',
                'You can add multiple ballots to a single election',
            ],
            relatedLinks: [
                { title: 'Create a Ballot', href: '/elections/{id}?tab=ballots' },
                { title: 'Ballot Types Explained', href: '/help/ballot-types' },
            ],
        },
        {
            id: 'ballots-no-options',
            title: 'Ballots Have No Options',
            description: 'Some ballots have no options/candidates. Voters cannot vote without options.',
            icon: FileText,
            steps: [
                'Go to the Ballots tab in your election',
                'Find the ballot that needs options',
                'Click the "Manage Options" button (Settings icon)',
                'Click "+ Add Option" to add candidates or choices',
                'Enter a title and optional description for each option',
                'Set the display order for options',
                'Click "Save Options" when done',
            ],
            tips: [
                'Options can have photos displayed to voters',
                'You can reorder options by dragging or using the arrow buttons',
                'Options can be duplicated if similar',
            ],
            relatedLinks: [
                { title: 'Manage Options', href: '/elections/{id}?tab=ballots' },
                { title: 'Adding Photos to Options', href: '/help/option-photos' },
            ],
        },
        {
            id: 'default-option-names',
            title: 'Default Option Names',
            description: 'Some options still have the default title "New Option". This may confuse voters.',
            icon: Edit,
            steps: [
                'Go to the Ballots tab in your election',
                'Find the ballot containing the default option',
                'Click the "Manage Options" button (Settings icon)',
                'Click on the option title field',
                'Change "New Option" to a meaningful name',
                'Click "Save Options" to update',
            ],
            tips: [
                'Use clear and descriptive option names',
                'Avoid using "New Option" or "Option 1"',
                'Consider adding descriptions for context',
            ],
            relatedLinks: [
                { title: 'Edit Options', href: '/elections/{id}?tab=ballots' },
                { title: 'Best Practices for Options', href: '/help/option-best-practices' },
            ],
        },
        {
            id: 'no-voters',
            title: 'No Voters Added',
            description: 'Your election has no voters. Voters must be invited to participate.',
            icon: Users,
            steps: [
                'Go to the Voters tab in your election',
                'Click the "Add Voters" button',
                'Add voters individually by entering name and email/voter ID',
                'Or download the CSV template and import multiple voters at once',
                'Voters will receive an invitation email with their unique voter key',
                'The voter key is required to access the voting page',
            ],
            tips: [
                'Either email OR voter ID is required for each voter',
                'CSV import supports bulk addition of voters',
                'You can export voter list at any time',
                'Voters can be removed if they haven\'t voted yet',
            ],
            relatedLinks: [
                { title: 'Add Voters', href: '/elections/{id}?tab=voters' },
                { title: 'Import CSV Guide', href: '/help/csv-import' },
                { title: 'Voter Email Templates', href: '/help/email-templates' },
            ],
        },
        {
            id: 'leaderboard-hidden',
            title: 'Leaderboard Hidden',
            description: 'The leaderboard is currently hidden from the public.',
            icon: Globe,
            steps: [
                'Go to your election overview page',
                'Click the "Leaderboard Settings" button (globe icon) next to the status badge',
                'Toggle the switch to "Public"',
                'Click "Save Changes"',
                'The leaderboard will now be visible to everyone',
            ],
            tips: [
                'You can hide/show leaderboard at any time',
                'Live elections show real-time results when enabled',
                'Completed elections can still have leaderboard enabled',
            ],
            relatedLinks: [
                { title: 'Leaderboard Settings', href: '/elections/{id}' },
                { title: 'Leaderboard Display Options', href: '/help/leaderboard-settings' },
            ],
        },
        {
            id: 'future-start-date',
            title: 'Start Date in Future',
            description: 'The election start date is set in the future. It won\'t start immediately.',
            icon: Calendar,
            steps: [
                'Go to your election overview page',
                'Click the "Edit" button or go to the election settings',
                'Update the start date to today or an earlier date',
                'Or wait for the scheduled date',
                'Save changes to update',
            ],
            tips: [
                'You can also set an end date for the election',
                'Elections automatically start on the specified date',
                'You can still launch early if needed',
            ],
            relatedLinks: [
                { title: 'Edit Election', href: '/elections/{id}/edit' },
                { title: 'Date and Time Settings', href: '/help/date-settings' },
            ],
        },
        {
            id: 'confirmation-dialog-disabled',
            title: 'Submit Ballot Confirmation Disabled',
            description: 'The submit ballot confirmation dialog is disabled. Voters may submit prematurely.',
            icon: Settings,
            steps: [
                'Go to Election Settings',
                'Find "Submission Settings" section',
                'Enable "Show confirmation dialog before submission"',
                'Save changes',
                'Voters will now see a confirmation dialog before finalizing their vote',
            ],
            tips: [
                'Confirmation dialogs prevent accidental submissions',
                'Recommended for all elections',
                'Voters can still change their mind before confirming',
            ],
            relatedLinks: [
                { title: 'Election Settings', href: '/elections/{id}/settings' },
                { title: 'Voter Experience Settings', href: '/help/voter-settings' },
            ],
        },
        {
            id: 'empty-ballot-options',
            title: 'Empty Ballot Options',
            description: 'Some ballots have options configured but they are empty or invalid.',
            icon: AlertCircle,
            steps: [
                'Go to the Ballots tab in your election',
                'Find the ballot with empty options',
                'Click the "Manage Options" button',
                'Remove any empty option entries',
                'Add valid options with meaningful titles',
                'Click "Save Options"',
            ],
            tips: [
                'Each option should have a unique title',
                'Options can have optional descriptions',
                'Minimum 1 option is required per ballot',
            ],
            relatedLinks: [
                { title: 'Manage Options', href: '/elections/{id}?tab=ballots' },
                { title: 'Option Guidelines', href: '/help/options-guide' },
            ],
        },
    ];

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getUrlWithAnchor = (href: string, electionId?: number) => {
        if (href.includes('{id}') && electionId) {
            return href.replace('{id}', electionId.toString());
        }
        return href;
    };

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setSidebarOpen(false);
        }
    };

    return (
        <>
            <Head title="Help Center - VoiceSphere" />

            <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] via-white to-red-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-red-950/20">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header with Theme Toggle */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-[#1b1b18] dark:text-white">Help Center</h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Guides and solutions for common election issues
                            </p>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? (
                                <Moon className="h-5 w-5" />
                            ) : (
                                <Sun className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="mb-4 md:hidden">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                            <Menu className="h-5 w-5" />
                            Menu
                        </button>
                    </div>

                    <div className="flex gap-8">
                        {/* Sidebar Navigation - Desktop */}
                        <aside className="hidden w-64 shrink-0 md:block">
                            <div className="sticky top-24 rounded-xl border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                                <div className="mb-4 pb-3 border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                                    <Link
                                        href="/elections"
                                        className="inline-flex items-center gap-2 text-sm text-gray-600 transition-all hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Elections
                                    </Link>
                                </div>
                                <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Navigation</h3>
                                <nav className="space-y-1">
                                    {helpSections.map((section) => {
                                        const Icon = section.icon;
                                        const isActive = activeSection === section.id;
                                        return (
                                            <button
                                                key={section.id}
                                                onClick={() => scrollToSection(section.id)}
                                                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                                                    isActive
                                                        ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-500'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-800'
                                                }`}
                                            >
                                                <Icon className="h-4 w-4" />
                                                <span className="truncate">{section.title}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="flex-1 min-w-0">
                            {/* Help Sections */}
                            <div className="space-y-6">
                                {helpSections.map((section) => {
                                    const Icon = section.icon;
                                    return (
                                        <div
                                            key={section.id}
                                            id={section.id}
                                            className="scroll-mt-24 rounded-xl border border-[#e3e3e0] bg-white transition-all hover:shadow-md dark:border-[#3E3E3A] dark:bg-[#161615]"
                                        >
                                            {/* Section Header */}
                                            <div className="flex items-start justify-between border-b border-[#e3e3e0] p-6 dark:border-[#3E3E3A]">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                                        <Icon className="h-5 w-5 text-red-600" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-white">
                                                            {section.title}
                                                        </h2>
                                                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                                                            {section.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const url = `${window.location.origin}/help#${section.id}`;
                                                        copyToClipboard(url, section.id);
                                                    }}
                                                    className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                                                    title="Copy link to this section"
                                                >
                                                    {copiedId === section.id ? (
                                                        <Check className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>

                                            {/* Steps */}
                                            <div className="border-b border-[#e3e3e0] p-6 dark:border-[#3E3E3A]">
                                                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    How to Fix
                                                </h3>
                                                <ol className="space-y-3">
                                                    {section.steps.map((step, idx) => (
                                                        <li key={idx} className="flex gap-3">
                                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                                                {idx + 1}
                                                            </span>
                                                            <span className="text-gray-700 dark:text-gray-300">{step}</span>
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>

                                            {/* Tips */}
                                            {section.tips && section.tips.length > 0 && (
                                                <div className="border-b border-[#e3e3e0] p-6 dark:border-[#3E3E3A]">
                                                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                        <MessageCircle className="h-4 w-4 text-blue-600" />
                                                        Pro Tips
                                                    </h3>
                                                    <ul className="space-y-2">
                                                        {section.tips.map((tip, idx) => (
                                                            <li key={idx} className="flex gap-2 text-gray-600 dark:text-gray-400">
                                                                <span className="text-blue-600">•</span>
                                                                {tip}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Related Links */}
                                            {section.relatedLinks && section.relatedLinks.length > 0 && (
                                                <div className="rounded-b-xl bg-gray-50 p-6 dark:bg-gray-900/20">
                                                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                        <ExternalLink className="h-4 w-4 text-purple-600" />
                                                        Related Resources
                                                    </h3>
                                                    <div className="flex flex-wrap gap-3">
                                                        {section.relatedLinks.map((link, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={getUrlWithAnchor(link.href, 1)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-sm text-red-600 transition-all hover:bg-red-50 hover:shadow-sm dark:bg-[#161615] dark:text-red-500 dark:hover:bg-red-900/20"
                                                            >
                                                                {link.title}
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Still Need Help? */}
                            <div className="mt-8 rounded-xl border border-[#e3e3e0] bg-gradient-to-r from-red-50 to-white p-8 text-center dark:border-[#3E3E3A] dark:from-red-950/20 dark:to-[#161615]">
                                <HelpCircle className="mx-auto h-12 w-12 text-red-600" />
                                <h3 className="mt-4 text-xl font-semibold text-[#1b1b18] dark:text-white">
                                    Still need help?
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    Our support team is ready to assist you with any issues.
                                </p>
                                <div className="mt-6 flex flex-wrap justify-center gap-3">
                                    <a
                                        href="mailto:support@voicesphere.com"
                                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700"
                                    >
                                        Contact Support
                                    </a>
                                    <a
                                        href="/docs"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-[#3E3E3A] dark:text-gray-300 dark:hover:bg-gray-800"
                                    >
                                        Read Documentation
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl dark:bg-[#161615]">
                        <div className="flex items-center justify-between border-b border-[#e3e3e0] p-4 dark:border-[#3E3E3A]">
                            <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-white">Navigation</h2>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <Link
                                href="/elections"
                                className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 transition-all hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Elections
                            </Link>
                            <nav className="mt-4 space-y-1">
                                {helpSections.map((section) => {
                                    const Icon = section.icon;
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => scrollToSection(section.id)}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-all hover:bg-gray-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-800"
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span className="truncate">{section.title}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}