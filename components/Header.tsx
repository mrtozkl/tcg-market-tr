import Link from 'next/link';
import { Search } from 'lucide-react';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/70 backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        TCG Market
                    </span>
                </Link>

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
                        {/* Placeholder for future auth/search */}
                        <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
