import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Github, Database, Users, Heart } from 'lucide-react';
import { getSellers } from '@/lib/data';

export default async function AboutPage() {
    const { metadata } = await getSellers();

    return (
        <main className="min-h-screen flex flex-col">
            <Header />

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-slate-950">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-500/10 via-slate-950 to-slate-950" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-cyan-500/10 via-slate-950 to-slate-950" />
                </div>

                <div className="container relative z-10 text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Hakkımızda
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        TCG Market Türkiye, koleksiyoncular tarafından koleksiyoncular için yapılmış,
                        Türkiye'nin en kapsamlı TCG rehberidir.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="container pb-24 -mt-8 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

                    {/* Mission Card */}
                    <div className="bg-card border border-white/10 rounded-2xl p-8 hover:border-primary/50 transition-colors group">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                            <Heart className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Misyonumuz</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Amacımız, Türkiye'deki TCG topluluğunu bir araya getirmek ve koleksiyoncuların aradıkları kartlara en kolay, güvenilir ve şeffaf şekilde ulaşmalarını sağlamaktır. Satıcıları ve ürünleri tek bir platformda toplayarak pazarın büyümesine katkıda bulunuyoruz.
                        </p>
                    </div>

                    {/* How it Works Card */}
                    <div className="bg-card border border-white/10 rounded-2xl p-8 hover:border-secondary/50 transition-colors group">
                        <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
                            <Database className="w-6 h-6 text-secondary" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Nasıl Çalışır?</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Sistemimiz, topluluk tarafından yönetilen ve sürekli güncellenen bir veritabanından beslenir. Satıcıların stokları ve fiyatları düzenli olarak kontrol edilir ve listelenir. Bu sayede her zaman en güncel bilgilere ulaşabilirsiniz.
                        </p>
                    </div>

                    {/* Community Card */}
                    <div className="bg-card border border-white/10 rounded-2xl p-8 hover:border-accent/50 transition-colors group md:col-span-2">
                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <div className="flex-1">
                                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                                    <Users className="w-6 h-6 text-accent" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4">Topluluk Odaklı</h2>
                                <p className="text-muted-foreground leading-relaxed mb-6">
                                    Bu proje tamamen açık kaynaklıdır ve topluluk katkılarıyla büyür. Siz de projeye katkıda bulunabilir, yeni özellikler önerebilir veya veri tabanımızı zenginleştirebilirsiniz.
                                </p>
                                <a
                                    href="https://github.com/mrtozkl/tcg-market-tr"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-slate-950 font-bold hover:bg-gray-200 transition-colors"
                                >
                                    <Github className="w-5 h-5" />
                                    GitHub'da Katkıda Bulun
                                </a>
                            </div>
                            <div className="w-full md:w-1/3 bg-slate-900/50 rounded-xl p-6 border border-white/5">
                                <h3 className="text-white font-bold mb-4">Katkıda Bulunanlar</h3>
                                <div className="flex -space-x-3">
                                    {/* Placeholder avatars */}
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs font-medium text-slate-400">
                                            User
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs font-medium text-slate-400">
                                        +5
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Footer metadata={metadata} />
        </main>
    );
}
