
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


export default function LoginPage() {
    const router = useRouter();
    useEffect(() => {
        let active = true;

        async function checkSession() {
            try {
                const response = await fetch("/api/auth/session", {
                    cache: "no-store",
                });

                if (!response.ok) return;

                const data = await response.json();

                if (active && data.authenticated) {
                    router.replace("/");
                }
            } catch {
                console.error("Unable to check login session");
            }
        }

        checkSession();

        return () => {
            active = false;
        };
    }, [router]);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Login failed");
            }

            router.replace("/");
            router.refresh();

        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090B12] px-4 py-10 text-white">
            {/* Background decoration */}
            <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-700/15 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/15 blur-[120px]" />

            <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#111521] shadow-2xl lg:grid-cols-2">

                {/* Branding panel */}
                <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#17172F] via-[#17182F] to-[#25204A] p-12 lg:flex">
                    <div className="absolute -right-24 top-24 h-72 w-72 rounded-full border border-violet-400/10" />
                    <div className="absolute -right-12 top-36 h-48 w-48 rounded-full border border-violet-400/15" />

                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 text-xl font-black shadow-lg shadow-violet-900/40">
                                N
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-wide">NIMAN PRINTS</h1>
                                <p className="text-xs tracking-[0.25em] text-violet-300">
                                    BUSINESS OS
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative my-16">
                        <span className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-300">
                            Your business. One platform.
                        </span>

                        <h2 className="mt-5 text-4xl font-bold leading-tight">
                            Create.
                            <br />
                            Manage.
                            <br />
                            <span className="bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
                                Grow.
                            </span>
                        </h2>

                        <p className="mt-6 max-w-sm leading-7 text-slate-400">
                            Manage orders, products, customers, production and business
                            operations from one intelligent workspace.
                        </p>
                    </div>

                    <div className="relative flex items-center gap-2 text-xs text-slate-500">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Your business workspace
                        <span className="ml-auto">Version 2.0</span>
                    </div>
                </section>

                {/* Login form */}
                <section className="flex flex-col justify-center p-7 sm:p-12">
                    <div className="mb-10 lg:hidden">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 font-black">
                                N
                            </div>
                            <div>
                                <h1 className="font-bold tracking-wide">NIMAN PRINTS</h1>
                                <p className="text-xs tracking-widest text-violet-300">
                                    BUSINESS OS
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-violet-400">
                            WELCOME BACK
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight">
                            Sign in to your account
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-slate-400">
                            Enter your credentials to access your business dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="mt-9 space-y-6">
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                autoComplete="username"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="w-full rounded-xl border border-[#30394D] bg-[#0B0F19] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                            />
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                                    Password
                                </label>
                                <span className="text-xs text-slate-500">
                                    Secure sign in
                                </span>
                            </div>

                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    className="w-full rounded-xl border border-[#30394D] bg-[#0B0F19] px-4 py-3.5 pr-20 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                />

                                {error && (
                                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-violet-300 hover:text-violet-200"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(event) => setRememberMe(event.target.checked)}
                                    className="h-4 w-4 accent-violet-500"
                                />
                                Remember me
                            </label>

                            <span className="text-xs text-slate-500">
                                Contact your administrator for password help
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-semibold shadow-lg shadow-violet-900/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Signing in..." : "Sign in to Dashboard"}
                            {!loading && <span>→</span>}
                        </button>
                    </form>

                    <div className="mt-10 border-t border-white/10 pt-6 text-center">
                        <p className="text-xs text-slate-500">
                            Niman Prints Business OS · Version 2.0
                        </p>
                        <p className="mt-2 text-xs text-slate-600">
                            Secure business management workspace
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
