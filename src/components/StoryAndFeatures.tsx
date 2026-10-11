import React from 'react';
import { Feather, Shield, Droplets, Sparkles, Sun, CheckCircle } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/products';
import { SiteContent } from '../data/siteContent';

interface StoryAndFeaturesProps {
  onGoToCatalogue: () => void;
  content?: SiteContent;
}

export const StoryAndFeatures: React.FC<StoryAndFeaturesProps> = ({ onGoToCatalogue, content }) => {
  const storyTagline = content?.story.tagline || "The Cotton Nest Story";
  const storyHeading = content?.story.heading || "Honest pure cotton, tailored for Indian bedrooms.";
  const p1 = content?.story.paragraph1 || "At Cotton Nest, based in Sector 46 Gurgaon, we started with a simple belief: bedsheets should never be made with sweaty synthetic microfiber or shrunk down to stingy sizes that untuck the moment you turn in bed.";
  const p2 = content?.story.paragraph2 || "Every single bedsheet in our collection is cut to an expansive King size (108×108 / 100×108 inch), guaranteeing a generous tuck-in under even the thickest modern orthopaedic mattresses.";
  
  const pillar1Title = content?.story.pillar1Title || "Zero Polyester";
  const pillar1Desc = content?.story.pillar1Desc || "Only 100% natural pure cotton yarns that breathe naturally and regulate temperature all night.";
  const pillar2Title = content?.story.pillar2Title || "True 108×108 King Size";
  const pillar2Desc = content?.story.pillar2Desc || "Generously proportioned for deep tuck-in on King and Super King beds without popping loose.";
  const pillar3Title = content?.story.pillar3Title || "Color-Fast Dyes";
  const pillar3Desc = content?.story.pillar3Desc || "Pre-tested reactive dyes that retain their warm cream, soft pink, and muted gold vibrancy after dozens of washes.";
  const pillar4Title = content?.story.pillar4Title || "Gurgaon Studio Direct";
  const pillar4Desc = content?.story.pillar4Desc || "No middleman markups. Shipped directly from Sector 46 Gurgaon with local pickup available.";

  return (
    <section className="py-12 sm:py-16 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Story Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A8823B]">
              <Sparkles className="w-3.5 h-3.5 text-[#C29E57]" />
              {storyTagline}
            </div>

            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#2C2420] text-balance leading-tight">
              {storyHeading}
            </h2>

            <p className="text-sm sm:text-base text-[#6B5D55] leading-relaxed">
              {p1}
            </p>

            <p className="text-sm sm:text-base text-[#6B5D55] leading-relaxed">
              {p2}
            </p>

            <div className="pt-2">
              <button
                onClick={onGoToCatalogue}
                className="px-6 py-3 bg-[#B83F60] hover:bg-[#A33452] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Browse Our Signature Bedsheets
              </button>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div className="lg:col-span-6 bg-[#F4EFE6] rounded-3xl p-6 sm:p-8 border border-[#EAE2D5] space-y-6">
            <h3 className="font-serif-luxury text-2xl font-semibold text-[#2C2420]">
              The Four Pillars of Cotton Nest
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE2D5] space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#FDEAF0] text-[#B83F60] flex items-center justify-center">
                  <Feather className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#2C2420] uppercase tracking-wide">
                  {pillar1Title}
                </h4>
                <p className="text-xs text-[#6B5D55] leading-relaxed">
                  {pillar1Desc}
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE2D5] space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7EE] text-[#A8823B] flex items-center justify-center border border-[#DEC89B]/50">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#2C2420] uppercase tracking-wide">
                  {pillar2Title}
                </h4>
                <p className="text-xs text-[#6B5D55] leading-relaxed">
                  {pillar2Desc}
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE2D5] space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7EE] text-[#A8823B] flex items-center justify-center border border-[#DEC89B]/50">
                  <Droplets className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#2C2420] uppercase tracking-wide">
                  {pillar3Title}
                </h4>
                <p className="text-xs text-[#6B5D55] leading-relaxed">
                  {pillar3Desc}
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE2D5] space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#FDEAF0] text-[#B83F60] flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#2C2420] uppercase tracking-wide">
                  {pillar4Title}
                </h4>
                <p className="text-xs text-[#6B5D55] leading-relaxed">
                  {pillar4Desc}
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Washing & Longevity FAQ */}
        <div className="pt-8 border-t border-[#EAE2D5]">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <h3 className="font-serif-luxury text-2xl font-semibold text-[#2C2420]">
              Caring for Your Cotton Nest Sheets
            </h3>
            <p className="text-xs text-[#7A6458]">
              Simple instructions to ensure your bedsheets stay soft for years.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-[#F4EFE6] rounded-xl border border-[#EAE2D5] space-y-1.5">
              <p className="font-semibold text-[#2C2420] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#3E7D5A]" /> First Wash Tip
              </p>
              <p className="text-[#6B5D55]">
                Wash separately in cold water on gentle cycle before first use to set the cotton fibers and unlock maximum softness.
              </p>
            </div>

            <div className="p-4 bg-[#F4EFE6] rounded-xl border border-[#EAE2D5] space-y-1.5">
              <p className="font-semibold text-[#2C2420] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#3E7D5A]" /> Detergent &amp; Bleach
              </p>
              <p className="text-[#6B5D55]">
                Use mild liquid laundry detergent. Never use harsh chemical chlorine bleach to preserve the soft pink and muted gold tones.
              </p>
            </div>

            <div className="p-4 bg-[#F4EFE6] rounded-xl border border-[#EAE2D5] space-y-1.5">
              <p className="font-semibold text-[#2C2420] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#3E7D5A]" /> Line Dry in Shade
              </p>
              <p className="text-[#6B5D55]">
                Drying in soft breeze or shade protects the cotton natural elasticity. Warm iron for that crisp 5-star hotel look.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
