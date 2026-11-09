import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { SiteContent, INITIAL_SITE_CONTENT } from '../data/siteContent';

interface TermsAndConditionsViewProps {
  siteContent?: SiteContent;
  onExploreCatalogue?: () => void;
}

export const TermsAndConditionsView: React.FC<TermsAndConditionsViewProps> = ({
  siteContent,
  onExploreCatalogue,
}) => {
  const contentToDisplay = siteContent?.termsAndConditions?.trim()
    ? siteContent.termsAndConditions
    : INITIAL_SITE_CONTENT.termsAndConditions;

  const renderFormattedContent = (rawText: string) => {
    const lines = rawText.split('\n');

    const formatInline = (text: string) => {
      const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
      return parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          return <strong key={pIdx} className="font-bold text-[#2C2420]">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
          return <strong key={pIdx} className="font-bold text-[#2C2420]">{part.slice(1, -1)}</strong>;
        }
        return part;
      });
    };

    return (
      <div className="space-y-3.5 text-[#2C2420] leading-relaxed text-sm sm:text-base">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-2" />;
          }

          // Horizontal rule dividers: ________________________________________
          if (trimmed.startsWith('___') || /^_{3,}$/.test(trimmed)) {
            return <hr key={idx} className="border-t border-[#DEC89B]/50 my-6" />;
          }

          // Top Banner Header: 🌸 COTTON NEST – TERMS & CONDITIONS
          if (trimmed.includes('COTTON NEST – TERMS & CONDITIONS') || trimmed.startsWith('🌸 COTTON NEST')) {
            return (
              <div key={idx} className="pb-3 border-b border-[#EAE2D5] space-y-1">
                <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#8C2E46] flex items-center gap-2">
                  <span>{formatInline(trimmed)}</span>
                </h2>
              </div>
            );
          }

          // Privacy, Loyalty, and other Special emoji sections
          if (trimmed.startsWith('🔒') || trimmed.startsWith('🎁') || trimmed.startsWith('✨') || trimmed.startsWith('🚚')) {
            return (
              <div key={idx} className="pt-6 pb-2 text-lg sm:text-xl font-bold font-serif-luxury text-[#2C2420] flex items-center gap-2 border-b border-[#EAE2D5]">
                <span>{formatInline(trimmed)}</span>
              </div>
            );
          }

          // Markdown subheadings: ###
          if (trimmed.startsWith('###')) {
            const headingText = trimmed.replace(/^###\s*/, '');
            return (
              <div key={idx} className="pt-3 pb-0.5 text-base sm:text-lg font-bold font-serif-luxury text-[#8C2E46] flex items-center gap-2">
                <span>{formatInline(headingText)}</span>
              </div>
            );
          }

          // Markdown headings: ## or #
          if (trimmed.startsWith('#')) {
            const headingText = trimmed.replace(/^#+\s*/, '');
            return (
              <div key={idx} className="pt-5 pb-1 text-lg sm:text-xl font-bold font-serif-luxury text-[#2C2420] border-b border-[#EAE2D5]">
                <h2>{formatInline(headingText)}</h2>
              </div>
            );
          }

          // All-caps section headings (e.g. PRODUCT REPRESENTATION, ORDER ACCEPTANCE, PRICING, etc.)
          const isAllCaps =
            trimmed.length >= 4 &&
            trimmed === trimmed.toUpperCase() &&
            /^[A-Z0-9\s&–—,()'-]+$/.test(trimmed) &&
            !trimmed.startsWith('•') &&
            !trimmed.startsWith('-') &&
            !trimmed.startsWith('O ');

          if (isAllCaps) {
            return (
              <div key={idx} className="pt-5 pb-1 text-base sm:text-lg font-bold font-serif-luxury text-[#2C2420] tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C29E57] shrink-0" />
                <h3 className="uppercase">{trimmed}</h3>
              </div>
            );
          }

          // Subheadings like "Gurgaon", "Rest of India", "General Conditions", "Manufacturing Defects Only", "Exchange Approval", "1. Earning Nest Points", "2. Loyalty Points Redemption"
          const isSubHeader =
            /^\d+\.\s+/.test(trimmed) ||
            trimmed === 'Gurgaon' ||
            trimmed === 'Rest of India' ||
            trimmed === 'General Conditions' ||
            trimmed === 'Manufacturing Defects Only' ||
            trimmed === 'Exchange Approval' ||
            trimmed === 'The customer must:' ||
            trimmed === 'Store credits:';

          if (isSubHeader) {
            return (
              <div key={idx} className="pt-2 pb-0.5 text-sm sm:text-base font-bold font-serif-luxury text-[#8C2E46]">
                {formatInline(trimmed)}
              </div>
            );
          }

          // Nested bullets starting with "o " or "o\t" or "o\u00A0"
          if (/^o[\s\t\u00A0]/.test(trimmed)) {
            const nestedText = trimmed.replace(/^o[\s\t\u00A0]+/, '');
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-6 text-sm sm:text-base text-[#4A3E38]">
                <span className="text-[#C29E57] text-xs mt-1 shrink-0">◦</span>
                <span>{formatInline(nestedText)}</span>
              </div>
            );
          }

          // Regular bullets starting with "••" or "•" or "-"
          if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
            const bulletText = trimmed.replace(/^[•\-]+\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-2 text-sm sm:text-base text-[#3C322C]">
                <span className="text-[#C29E57] font-bold text-lg leading-none mt-0.5 shrink-0">•</span>
                <span>{formatInline(bulletText)}</span>
              </div>
            );
          }

          // Arrow lines
          if (trimmed.startsWith('👉')) {
            const arrowText = trimmed.replace(/^\s*👉\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-2 text-sm sm:text-base text-[#2C2420]">
                <span className="text-lg shrink-0">👉</span>
                <div>{formatInline(arrowText)}</div>
              </div>
            );
          }

          // Regular paragraph
          return (
            <p key={idx} className="text-[#2C2420]">
              {formatInline(line)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-[#FAF7F2] min-h-[75vh] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDEAF0] text-[#8C2E46] text-xs font-semibold border border-[#FAD1DC]">
            <Sparkles className="w-3.5 h-3.5 text-[#B83F60]" />
            <span>Cotton Nest Store Policies &amp; Legal Guidelines</span>
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2420] tracking-tight">
            Terms &amp; Conditions (T&amp;C)
          </h1>
          <p className="text-sm text-[#7A6458] max-w-xl mx-auto">
            Please review our store policies, product representation, delivery guidelines, exchange terms, and customer rights.
          </p>
        </div>

        {/* Main Content Card with Exact Verbatim Text */}
        <div className="bg-white rounded-3xl border border-[#DEC89B] shadow-sm p-6 sm:p-10 lg:p-12 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FDEAF0]/40 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#F4EFE6]/60 rounded-full blur-2xl pointer-events-none" />

          <div className="relative">
            {renderFormattedContent(contentToDisplay)}
          </div>
        </div>

        {/* Back to Catalogue CTA */}
        {onExploreCatalogue && (
          <div className="text-center pt-2">
            <button
              onClick={onExploreCatalogue}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#2C2420] hover:bg-[#433731] text-[#FAF7F2] rounded-2xl text-sm font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <span>Explore Bedsheet Catalogue</span>
              <ArrowRight className="w-4 h-4 text-[#DEC89B]" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
