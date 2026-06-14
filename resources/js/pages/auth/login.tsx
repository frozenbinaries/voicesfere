import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in to VoiceSphere" />

            {/* Full screen container */}
            <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
                {/* Full Screen 2-Column Container */}
                <div className="w-full h-full bg-white dark:bg-gray-800 overflow-hidden">
                    <div className="flex flex-col md:flex-row h-full w-full">

                        {/* Left Column - Branding */}
                        <div className="w-full md:w-1/2 bg-gradient-to-br from-red-600 to-red-800 p-6 md:p-8 lg:p-10 flex flex-col justify-center items-center text-center h-full overflow-hidden">
                            <div className="w-full max-w-md">
                                {/* Logo */}
                                <div className="mb-8 flex justify-center">
                                    <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Brand Name */}
                                <div className="mb-8">
                                    <div className="text-white text-4xl md:text-5xl font-bold mb-2">
                                        Voice<span className="text-red-300">Sphere</span>
                                    </div>
                                    <div className="text-white/80 text-lg md:text-xl font-semibold mb-2">
                                        Every Voice Matters
                                    </div>
                                    <div className="text-white/60 text-sm">
                                        Secure Digital Voting Platform
                                    </div>
                                </div>

                                {/* Features List */}
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center justify-center gap-3 text-white/90 text-sm md:text-base">
                                        <span className="text-red-300 text-xl">✓</span>
                                        <span>Secure & Anonymous Voting</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-3 text-white/90 text-sm md:text-base">
                                        <span className="text-red-300 text-xl">✓</span>
                                        <span>Real-Time Results</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-3 text-white/90 text-sm md:text-base">
                                        <span className="text-red-300 text-xl">✓</span>
                                        <span>Audit Trail & Transparency</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-3 text-white/90 text-sm md:text-base">
                                        <span className="text-red-300 text-xl">✓</span>
                                        <span>Multi-Platform Support</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                                    <div>
                                        <div className="text-white text-2xl font-bold">1000+</div>
                                        <div className="text-white/70 text-xs">Elections</div>
                                    </div>
                                    <div>
                                        <div className="text-white text-2xl font-bold">50K+</div>
                                        <div className="text-white/70 text-xs">Votes Cast</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Login Form */}
                        <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-10 flex flex-col justify-center h-full overflow-y-auto">
                            <div className="max-w-md mx-auto w-full">
                                {/* Welcome Text */}
                                <div className="mb-8">
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                        Welcome Back
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                                        Log in to access your dashboard and manage elections
                                    </p>
                                </div>

                                {/* Status Message */}
                                {status && (
                                    <div className="mb-6 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center text-sm font-medium text-green-700 dark:text-green-400">
                                        {status}
                                    </div>
                                )}

                                {/* Passkey Verify Component */}
                                <PasskeyVerify />

                                {/* Login Form */}
                                <Form
                                    {...store.form()}
                                    resetOnSuccess={['password']}
                                    className="flex flex-col gap-5"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            {/* Email Field */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium text-sm md:text-base">
                                                    Email Address
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    placeholder="you@example.com"
                                                    className="border-gray-300 dark:border-gray-600 focus:border-red-600 focus:ring-red-600 dark:focus:border-red-600 dark:focus:ring-red-600 rounded-lg text-sm md:text-base py-2.5 px-4"
                                                />
                                                <InputError message={errors.email} />
                                            </div>

                                            {/* Password Field */}
                                            <div className="grid gap-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium text-sm md:text-base">
                                                        Password
                                                    </Label>
                                                    {canResetPassword && (
                                                        <TextLink
                                                            href={request()}
                                                            className="text-xs md:text-sm text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 transition"
                                                            tabIndex={5}
                                                        >
                                                            Forgot password?
                                                        </TextLink>
                                                    )}
                                                </div>
                                                <PasswordInput
                                                    id="password"
                                                    name="password"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="current-password"
                                                    placeholder="Enter your password"
                                                    className="border-gray-300 dark:border-gray-600 focus:border-red-600 focus:ring-red-600 dark:focus:border-red-600 dark:focus:ring-red-600 rounded-lg text-sm md:text-base py-2.5 px-4"
                                                />
                                                <InputError message={errors.password} />
                                            </div>

                                            {/* Remember Me Checkbox */}
                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    id="remember"
                                                    name="remember"
                                                    tabIndex={3}
                                                    className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 h-4 w-4"
                                                />
                                                <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                                                    Remember me
                                                </Label>
                                            </div>

                                            {/* Submit Button */}
                                            <Button
                                                type="submit"
                                                className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition shadow-md hover:shadow-lg disabled:opacity-50 text-sm md:text-base"
                                                tabIndex={4}
                                                disabled={processing}
                                                data-test="login-button"
                                            >
                                                {processing && <Spinner className="mr-2" />}
                                                Sign In
                                            </Button>

                                            {/* Register Link */}
                                            <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4">
                                                Don't have an account?{' '}
                                                <TextLink
                                                    href={register()}
                                                    className="font-semibold text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 transition"
                                                    tabIndex={5}
                                                >
                                                    Create an account
                                                </TextLink>
                                            </div>
                                        </>
                                    )}
                                </Form>

                                {/* Back to Home Link */}
                                <div className="text-center mt-8">
                                    <Link
                                        href="/"
                                        className="text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition inline-flex items-center gap-1"
                                    >
                                        ← Back to Home
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}