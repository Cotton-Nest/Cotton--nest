import React from 'react';
import { X, Check, MessageCircle, ShoppingBag, ShieldCheck, Truck, RotateCcw, MapPin, Sparkles } from 'lucide-react';
import { BedsheetProduct, BedsheetVariant, COMPANY_DETAILS } from '../data/products';
import { sendWhatsAppProductOrder } from '../utils/whatsappOrder';
import { resolveBedsheetImage, handleImageFallback } from '../utils/imageUrl';

interface ProductModalProps {
  product: BedsheetProduct | null;
  onClose: () => void;
  onAddToCart: (product: BedsheetProduct, quantity: number, variant?: BedsheetVariant) => void;
  customImage?: string;
  onUploadImage?: (productId: string, dataUrl: string) => void;
  isOwnerMode?: boolean;
  onViewTermsAndConditions?: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  customImage,
  onUploadImage,
  isOwnerMode = false,
  onViewTermsAndConditions,
}) => {
  const [quantity, setQuantity] = React.useState(1);
  const [added, setAdded] = React.useState(false);
  const [selectedVariantId, setSelectedVariantId] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setSelectedVariantId(null);
    setQuantity(1);
    setAdded(false);
  }, [product?.id, product?.image, customImage]);

  if (!product) return null;

  const activeVariant = selectedVariantId
    ? product.variants?.find((v) => v.id === selectedVariantId)
    : undefined;

  const rawImage = activeVariant?.image || product.image || customImage;
  const displayImage = resolveBedsheetImage(rawImage, product.id, product.updatedAt);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadImage) {
      onUploadImage(product.id, file as any);
    }
  };

  const isOutOfStock = !product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0);
  const maxQty = product.stockQuantity && product.stockQuantity > 0 ? product.stockQuantity : 10;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(product, quantity, activeVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWhatsApp = () => {
    sendWhatsAppProductOrder({
      productName: product.name,
      variantName: activeVariant?.name,
      dimensions: product.dimensions,
      quantity,
      price: product.price,
      imageUrl: displayImage,
    });
  };

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2420]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-[#FAF7F2] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#EAE2D5] shadow-2xl z-10 text-[#2C2420]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#7A6458] hover:text-[#2C2420] rounded-full bg-white/80 backdrop-blur-xs border border-[#EAE2D5] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8">
          
          {/* Left Column: Big Product Photography & Features */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#EAE2D5] bg-[#F4EFE6]">
              <img
                src={displayImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                onError={handleImageFallback}
                className="w-full h-full object-cover object-center"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 bg-[#FAF7F2]/95 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-semibold text-[#8C2E46] border border-[#FAD1DC]">
                  {product.badge}
                </span>
              )}

              {/* Upload photo button inside modal - only visible to store owners */}
              {isOwnerMode && (
                <div className="absolute bottom-3 right-3 z-10">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-[#FAF7F2]/90 hover:bg-white text-[#2C2420] text-xs font-medium rounded-lg border border-[#EAE2D5] shadow-xs backdrop-blur-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>📷 Use Exact Photo (Owner)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Micro highlights */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-[#F4EFE6] rounded-xl border border-[#EAE2D5]">
                <p className="text-[10px] text-[#7A6458] uppercase">Dimension</p>
                <p className="font-semibold text-[#2C2420] mt-0.5">108″ × 108″</p>
              </div>
              <div className="p-2.5 bg-[#F4EFE6] rounded-xl border border-[#EAE2D5]">
                <p className="text-[10px] text-[#7A6458] uppercase">Thread Count</p>
                <p className="font-semibold text-[#2C2420] mt-0.5">{product.threadCount}</p>
              </div>
              <div className="p-2.5 bg-[#F4EFE6] rounded-xl border border-[#EAE2D5]">
                <p className="text-[10px] text-[#7A6458] uppercase">Material</p>
                <p className="font-semibold text-[#2C2420] mt-0.5">100% Cotton</p>
              </div>
            </div>

            {/* Store Pickup Callout */}
            <div className="p-3 bg-[#FDEAF0]/60 rounded-xl border border-[#F9D3DE] flex items-center gap-2.5 text-xs text-[#8C2E46]">
              <MapPin className="w-4 h-4 text-[#B83F60] shrink-0" />
              <span>Available for touch &amp; feel at Sector 46 Gurgaon Atelier</span>
            </div>

            {/* Return / Exchange Reassurance under photo */}
            <div className="p-3 bg-white rounded-xl border border-[#EAE2D5] flex items-center justify-between text-xs text-[#2C2420]">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#8C2E46] shrink-0" />
                <span><strong>Exchange Policy:</strong> Mfg defects only (48 hrs)</span>
              </div>
              {onViewTermsAndConditions && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewTermsAndConditions();
                  }}
                  className="text-[11px] font-semibold text-[#8C2E46] hover:underline cursor-pointer"
                >
                  T&amp;C Policy →
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="flex flex-col justify-between space-y-5">
            
            <div className="space-y-4">
              {/* Category & Collection */}
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#A8823B]">
                <span>{product.collection}</span>
                <span>·</span>
                <span className={isOutOfStock ? "text-amber-800" : "text-[#3E7D5A]"}>
                  {isOutOfStock ? "Out of Stock" : "In Stock"}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#2C2420] leading-snug">
                {product.name}
              </h2>

              {/* Price & Savings */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-[#2C2420] tabular-nums">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-[#9B8C83] line-through tabular-nums">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-semibold text-[#B83F60] bg-[#FDEAF0] px-2 py-0.5 rounded border border-[#FAD1DC]">
                    Save {discountPercent}% (₹{(product.originalPrice - product.price).toLocaleString('en-IN')})
                  </span>
                </div>

                {/* Shipping Extra Notice */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#EAE2D5] text-xs text-[#6B5D55]">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Truck className="w-3.5 h-3.5 text-[#B83F60] shrink-0" />
                    <span className="font-semibold text-[#2C2420]">+ Shipping Extra:</span>
                  </div>
                  <span className="text-[11px] sm:text-xs">
                    Free delivery only in Sec 46 Gurgaon · Rest of Gurgaon: Self pickup or on actuals · Across India: ₹100
                  </span>
                </div>

                {/* Return & Exchange Policy Card */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FDEAF0]/50 border border-[#FAD1DC] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#8C2E46] uppercase tracking-wider">
                      <RotateCcw className="w-4 h-4 text-[#8C2E46] shrink-0" />
                      <span>Return &amp; Exchange Policy</span>
                    </div>
                    {onViewTermsAndConditions && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onViewTermsAndConditions();
                        }}
                        className="text-[11px] font-semibold text-[#8C2E46] hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <span>Full T&amp;C</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-[#3C322C] leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="text-[#8C2E46] font-bold text-sm leading-none mt-0.5">•</span>
                      <p>
                        <strong className="text-[#2C2420]">Manufacturing Defects Only:</strong> Exchange is applicable only for genuine manufacturing defects reported within <strong>48 hours of delivery</strong> with clear unboxing photos/videos.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#8C2E46] font-bold text-sm leading-none mt-0.5">•</span>
                      <p>
                        <strong className="text-[#2C2420]">Condition:</strong> Must be unused, unwashed &amp; in original packaging.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#8C2E46] font-bold text-sm leading-none mt-0.5">•</span>
                      <p>
                        <strong className="text-[#2C2420]">Colour &amp; Lighting:</strong> Slight colour variations due to natural lighting/photography are not defects. Original vs catalogue photos provided wherever possible.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#8C2E46] font-bold text-sm leading-none mt-0.5">•</span>
                      <p>
                        <strong className="text-[#2C2420]">Resolution:</strong> Exchanged with same/equivalent product. Store credit valid for 2 months provided if unavailable. No cash refunds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#EAE2D5]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#2C2420]">Choose Color / Style:</span>
                    <span className="font-bold text-[#8C2E46] bg-[#FDEAF0] px-2 py-0.5 rounded text-[11px]">
                      {activeVariant ? activeVariant.name : 'Select a color'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(selectedVariantId === v.id ? null : v.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          activeVariant?.id === v.id
                            ? 'border-[#8C2E46] bg-[#FDEAF0] text-[#8C2E46] shadow-xs ring-1 ring-[#8C2E46]'
                            : 'border-[#EAE2D5] bg-white text-[#6B5D55] hover:border-[#DEC89B]'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shrink-0"
                          style={{ backgroundColor: v.colorHex || '#C29E57' }}
                        />
                        <span>{v.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Editorial Description */}
              <p className="text-sm text-[#6B5D55] leading-relaxed">
                {product.description}
              </p>

              {/* Key Bullet Features */}
              <div className="space-y-2 pt-2 border-t border-[#EAE2D5]">
                <p className="text-xs font-semibold uppercase text-[#7A6458] tracking-wider">
                  Product Specifications
                </p>
                <ul className="space-y-1.5 text-xs text-[#4A3E38]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#3E7D5A] shrink-0" />
                    <span><strong>Bedsheet Size:</strong> {product.dimensions}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#3E7D5A] shrink-0" />
                    <span><strong>Pillow Shams:</strong> {product.pillowCovers} with flap tuck</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#3E7D5A] shrink-0" />
                    <span><strong>Fabric:</strong> {product.fabric} (Zero Polyester)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#3E7D5A] shrink-0" />
                    <span><strong>Care:</strong> Machine wash cold, gentle cycle, tumble dry low</span>
                  </li>
                </ul>
              </div>

              {/* Quantity Selector & Stock Info */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-[#7A6458]">Quantity:</span>
                  <div className="inline-flex items-center rounded-lg border border-[#EAE2D5] bg-[#FAF7F2]">
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 text-sm text-[#2C2420] hover:bg-[#F4EFE6] rounded-l-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-sm font-semibold text-[#2C2420] tabular-nums">
                      {isOutOfStock ? 0 : quantity}
                    </span>
                    <button
                      type="button"
                      disabled={isOutOfStock || quantity >= maxQty}
                      onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                      className="px-3 py-1 text-sm text-[#2C2420] hover:bg-[#F4EFE6] rounded-r-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-xs">
                  {isOutOfStock ? (
                    <span className="font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      Temporarily Out of Stock
                    </span>
                  ) : (
                    <span className="text-[#3E7D5A] font-medium">
                      ✓ In Stock ({product.stockQuantity ?? 10} units available)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-4 border-t border-[#EAE2D5]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isOutOfStock ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-[#EAE2D5] text-[#8C7A70] cursor-not-allowed"
                  >
                    Sold Out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      added
                        ? 'bg-emerald-700 text-white'
                        : 'bg-[#B83F60] hover:bg-[#A33452] text-white shadow-sm'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4" />
                        Added to Bag!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        Add to Bag · ₹{(product.price * quantity).toLocaleString('en-IN')}
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="w-full py-3 px-4 bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#2C2420] border border-[#DEC89B] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  {isOutOfStock ? 'Waitlist on WhatsApp' : 'Order on WhatsApp'}
                </button>
              </div>

              {/* Guarantees */}
              <div className="flex items-center justify-between text-[11px] text-[#7A6458] pt-2 px-1">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#C29E57]" /> Direct Atelier Dispatch
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C29E57]" /> 100% Genuine Cotton
                </span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-[#8C2E46]" /> 48h Defect Exchange
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
