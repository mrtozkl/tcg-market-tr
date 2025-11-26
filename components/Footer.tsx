import React from 'react';
import { ExternalLink, Github } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Hakkımızda</h3>
                    <p>
                        TCG Market Türkiye, Türkiye'deki TCG (Trading Card Game) koleksiyoncularını ve satıcılarını
                        bir araya getiren bağımsız bir rehberdir. Amacımız, koleksiyoncuların aradıkları kartlara
                        ve ürünlere en kolay şekilde ulaşmalarını sağlamaktır.
                    </p>
                </div>

                <div className="footer-section">
                    <h3>Veri Kaynağı</h3>
                    <p>
                        Bu sitedeki veriler, topluluk tarafından yönetilen bir Google Sheet üzerinden
                        otomatik olarak çekilmektedir. Verilerin güncelliği ve doğruluğu topluluk katkılarıyla sağlanır.
                    </p>
                    <a
                        href="https://docs.google.com/spreadsheets/d/1NhCFUEdG6DuS1zxCTGYXNgiF9PJRT02HIj-Bh-a6y7M"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                    >
                        Google Sheet'i Görüntüle <ExternalLink size={14} />
                    </a>
                </div>

                <div className="footer-section">
                    <h3>Yasal Uyarı</h3>
                    <p className="disclaimer">
                        Bu proje tamamen bilgilendirme amaçlıdır ve kar amacı gütmemektedir.
                        Listelenen satıcılarla herhangi bir ticari bağımız bulunmamaktadır.
                    </p>
                </div>
            </div>
            <div className="footer-bottom">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <p>&copy; {new Date().getFullYear()} TCG Market Türkiye. Topluluk için yapılmıştır.</p>
                    <a
                        href="https://github.com/mrtozkl/tcg-market-tr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                        style={{ fontSize: '0.9rem', opacity: 0.8 }}
                    >
                        <Github size={16} /> GitHub'da İncele
                    </a>
                </div>
            </div>
        </footer>
    );
}
