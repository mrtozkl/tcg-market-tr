'use client';

import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/70 backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        TCG Market
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/" className="hover:text-primary transition-colors">
                            Satıcılar
                        </Link>
                        <Link href="/cards" className="hover:text-primary transition-colors">
                            Kartlar
                        </Link>
                        <Link href="/about" className="hover:text-primary transition-colors">
                            Hakkında
                        </Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-md">
                    <nav className="container flex flex-col gap-4 py-4 text-sm font-medium text-muted-foreground">
                        <Link
                            href="/"
                            className="hover:text-primary transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Satıcılar
                        </Link>
                        <Link
                            href="/cards"
                            className="hover:text-primary transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Kartlar
                        </Link>
                        <Link
                            href="/about"
                            className="hover:text-primary transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Hakkında
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
