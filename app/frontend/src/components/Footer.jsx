import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  const { t } = useApp();
  const [email, setEmail] = useState("");

  const subscribe = async (e) => {
    e.preventDefault();
    try { await api.post("/newsletter", { email }); toast.success(t.newsletter.done); setEmail(""); }
    catch { toast.error("Please enter a valid email"); }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 mt-24" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate-950 font-display font-bold text-lg">A</div>
            <span className="font-display font-bold text-2xl text-white">AllNeeds</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-6">{t.footer.about}</p>
          <div className="flex gap-3">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors" data-testid={`social-${i}`}>
                <Icon className="w-4 h-4" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">{t.footer.shop}</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/shop" className="hover:text-white transition-colors">{t.nav.shop}</Link></li>
            <li><Link to="/categories" className="hover:text-white transition-colors">{t.nav.categories}</Link></li>
            <li><Link to="/shop?best_seller=true" className="hover:text-white transition-colors">{t.sections.best}</Link></li>
            <li><Link to="/shop?new_arrival=true" className="hover:text-white transition-colors">{t.sections.new}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">{t.footer.company}</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/about" className="hover:text-white transition-colors">{t.nav.about}</Link></li>
            <li><Link to="/faq" className="hover:text-white transition-colors">{t.nav.faq}</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/returns" className="hover:text-white transition-colors">Return Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">{t.footer.contact}</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={1.5} /> Dubai, United Arab Emirates</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" strokeWidth={1.5} /> +971 4 000 0000</li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0" strokeWidth={1.5} /> hello@allneeds.ae</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <form onSubmit={subscribe} className="flex w-full md:w-auto max-w-sm gap-2" data-testid="footer-newsletter">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder={t.newsletter.placeholder}
              className="flex-1 bg-white/10 rounded-full py-2.5 px-4 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-white/50" data-testid="footer-newsletter-input" />
            <button type="submit" className="bg-white text-slate-950 rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-slate-200 transition-colors">{t.newsletter.btn}</button>
          </form>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>{t.footer.pay}:</span>
            <span className="font-semibold text-slate-200">VISA</span>
            <span className="font-semibold text-slate-200">Mastercard</span>
            <span className="font-semibold text-slate-200"> Pay</span>
            <span className="font-semibold text-slate-200">G Pay</span>
          </div>
        </div>
        <div className="text-center text-xs text-slate-500 pb-8">© {new Date().getFullYear()} AllNeeds. {t.footer.rights}</div>
      </div>
    </footer>
  );
};
