import React from 'react';
import { ArrowRight, ShieldCheck, HeartHandshake, Sparkles, MapPin, MessageCircle } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/products';
import { SiteContent } from '../data/siteContent';

interface HeroProps {
  onExploreCatalogue: () => void;
  onVisitStore: () => void;
  content?: SiteContent;
}

export const Hero: React.FC<HeroProps> = ({ onExploreCatalogue, onVisitStore, content }) => {
  const kicker = content?.hero.kicker || "Handcrafted Pure Cotton Bedding · Gurgaon Atelier";
  const headline = content?.hero.headline || "The touch of pure cotton, woven for serene mornings.";
  const subheadline = content?.hero.subheadline || "Welcome to Cotton Nest. Discover our exclusive release of pure cotton King size bedsheets — tailored from 100% natural long-staple cotton with breathable comfort, delicate florals, and subtle muted golden accents.";
  const ctaText = content?.hero.ctaButtonText || "View Bedsheets Catalogue";
  const secondaryText = content?.hero.secondaryButtonText || "Visit Gurgaon Studio";

  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-20 bg-gradient-to-b from-[#FAF7F2] via-[#FAF7F2] to-[#F5EFEB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial & Brand copy */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            {/* Quiet text kicker - zero pill discipline */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A8823B]">
              <span>{kicker}</span>
            </div>

            {/* Display Headline with balanced wrap */}
            <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#2C2420] leading-[1.15] text-balance">
              {headline}
            </h1>

            {/* Body description */}
            <p className="text-base sm:text-lg text-[#6B5D55] leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              {subheadline}
            </p>

            {/* CTA action cluster */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onExploreCatalogue}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#B83F60] hover:bg-[#A33452] text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onVisitStore}
                className="w-full sm:w-auto px-5 py-3.5 bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#2C2420] border border-[#EAE2D5] hover:border-[#C29E57] text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#C29E57]" />
                <span>{secondaryText}</span>
              </button>
            </div>

            {/* Quiet trust markers - clean unboxed typography */}
            <div className="pt-4 border-t border-[#EAE2D5] flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-[#7A6458]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C29E57]" />
                100% Pure Cotton
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#B83F60]" />
                108×108 King Tuck-In Drop
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                Direct WhatsApp Ordering
              </span>
            </div>

          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#EAE2D5] shadow-lg bg-[#FAF7F2] aspect-[16/10] sm:aspect-[16/11]">
              <img
                src="/images/hero_cotton_nest_bedding_1790996973951.jpg"
                alt="Cotton Nest luxury master bedroom featuring pure cotton bedding in cream, blush pink, and muted gold"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C2420]/40 via-transparent to-transparent pointer-events-none" />
              
              {/* Floating aesthetic location badge */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs bg-[#FAF7F2]/95 backdrop-blur-md p-3 rounded-xl border border-[#EAE2D5] text-left shadow-sm">
                <p className="text-[11px] font-semibold text-[#B83F60] uppercase tracking-wide">
                  Gurgaon Flagship
                </p>
                <p className="text-xs text-[#2C2420] font-medium leading-snug">
                  Sector 46, Gurgaon · Ground Floor 2508
                </p>
                <p className="text-[11px] text-[#7A6458] mt-0.5">
                  Try our fabrics in person or order direct via WhatsApp
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
