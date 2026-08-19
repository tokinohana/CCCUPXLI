import { Link, NavLink } from "react-router-dom";

import { GlyphPyramid, GlyphStepBlock, GlyphSun } from "@/components/glyphs";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import logo from "/favicon.png";

const NAV_ITEMS = [
    { to: "/", label: "Beranda", Icon: GlyphSun },
    { to: "/dasbor", label: "Pendaftaran", Icon: GlyphStepBlock },
];

export function SiteShell({ children }) {
    const { signedIn, signOut } = useAuth();

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Temple lintel navbar */}
            <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background">
                <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
                    <Link to="/" className="flex items-center gap-3">
                        <img src={logo} className="h-8 w-8"/>
                        <span className="font-display text-xl uppercase tracking-wider">CC Cup XLI</span>
                    </Link>

                    <nav className="hidden items-center gap-1 sm:flex">
                        {NAV_ITEMS.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    cn(
                                        "border-2 border-transparent px-4 py-2 font-display text-base uppercase tracking-wide hover:border-foreground",
                                        isActive && "border-foreground bg-secondary font-bold"
                                    )
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                        {signedIn ? (
                            <button
                                onClick={() => void signOut()}
                                className="border-2 border-transparent px-4 py-2 font-display text-base uppercase tracking-wide hover:border-foreground"
                            >
                                Keluar
                            </button>
                        ) : (
                            <NavLink
                                to="/masuk"
                                className={({ isActive }) =>
                                    cn(
                                        "border-2 border-transparent px-4 py-2 font-display text-base uppercase tracking-wide hover:border-foreground",
                                        isActive && "border-foreground bg-secondary font-bold"
                                    )
                                }
                            >
                                Masuk
                            </NavLink>
                        )}
                    </nav>
                </div>
            </header>

            {/* Stepped decorative band */}
            <div className="stepped-rule w-full" />

            {/* Content area */}
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 pb-24 sm:pb-8">
                {children}
            </main>

            {/* Maya frieze footer */}
            <footer className="mt-auto border-t-2 border-foreground bg-secondary">
                <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-4 py-6 text-center sm:flex-row sm:text-left">
                    <div className="flex items-center gap-2">
                        <GlyphPyramid className="h-5 w-5 text-primary" />
                        <span className="font-display text-sm uppercase tracking-wider">
                            CC Cup XLI — Kanisius
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Sistem Pendaftaran Terpadu • Dikelola oleh Panitia CC Cup XLI
                    </p>
                </div>
            </footer>

            {/* Mobile bottom navigation bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t-2 border-foreground bg-background sm:hidden">
                {NAV_ITEMS.map(({ to, label, Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-1 flex-col items-center gap-1 py-3 text-foreground",
                                isActive && "bg-secondary font-bold"
                            )
                        }
                    >
                        <Icon className="h-6 w-6" />
                        <span className="font-display text-xs uppercase tracking-wide">{label}</span>
                    </NavLink>
                ))}
                {signedIn ? (
                    <button
                        onClick={() => void signOut()}
                        className="flex flex-1 flex-col items-center gap-1 py-3 text-foreground"
                    >
                        <GlyphPyramid className="h-6 w-6" />
                        <span className="font-display text-xs uppercase tracking-wide">Keluar</span>
                    </button>
                ) : (
                    <NavLink
                        to="/masuk"
                        className={({ isActive }) =>
                            cn(
                                "flex flex-1 flex-col items-center gap-1 py-3 text-foreground",
                                isActive && "bg-secondary font-bold"
                            )
                        }
                    >
                        <GlyphPyramid className="h-6 w-6" />
                        <span className="font-display text-xs uppercase tracking-wide">Masuk</span>
                    </NavLink>
                )}
            </nav>
        </div>
    );
}

export function Panel({ title, description, children, className, aside }) {
    return (
        <section className={cn("block-carved mb-8", className)}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-foreground bg-secondary px-5 py-4">
                <div>
                    <h2 className="text-2xl">{title}</h2>
                    {description ? (
                        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    ) : null}
                </div>
                {aside}
            </div>
            <div className="p-5">{children}</div>
        </section>
    );
}