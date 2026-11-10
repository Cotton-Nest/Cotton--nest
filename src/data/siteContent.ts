export interface SiteContent {
  company: {
    name: string;
    tagline: string;
    phone: string;
    rawPhone: string;
    address: string;
    city: string;
    pincode: string;
    operatingHours: string;
  };
  announcement: {
    enabled: boolean;
    text: string;
    badge: string;
  };
  hero: {
    kicker: string;
    headline: string;
    subheadline: string;
    ctaButtonText: string;
    secondaryButtonText: string;
  };
  story: {
    tagline: string;
    heading: string;
    paragraph1: string;
    paragraph2: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
    pillar4Title: string;
    pillar4Desc: string;
  };
  termsAndConditions: string;
}

export const INITIAL_SITE_CONTENT: SiteContent = {
  company: {
    name: "Cotton Nest",
    tagline: "Pure Cotton Comfort, Everyday Elegance",
    phone: "+91 7838625915",
    rawPhone: "917838625915",
    address: "House Number 2508, Ground Floor, Sector 46, Gurgaon, Haryana",
    city: "Gurgaon, Haryana",
    pincode: "122003",
    operatingHours: "Monday - Sunday · 10:00 AM - 8:30 PM IST",
  },
  announcement: {
    enabled: true,
    text: "Experience 100% Pure Combed Cotton · Direct From Sector 46 Gurgaon Atelier",
    badge: "Gurgaon Atelier Exclusive",
  },
  hero: {
    kicker: "Handcrafted Pure Cotton Bedding · Gurgaon Atelier",
    headline: "The touch of pure cotton, woven for serene mornings.",
    subheadline: "Welcome to Cotton Nest. Discover our curated collection of King size bedsheets — tailored from 100% natural long-staple cotton with breathable comfort, delicate florals, and subtle muted golden accents.",
    ctaButtonText: "View Bedsheets Catalogue",
    secondaryButtonText: "Visit Gurgaon Studio",
  },
  story: {
    tagline: "The Cotton Nest Story",
    heading: "Honest pure cotton, tailored for Indian bedrooms.",
    paragraph1: "At Cotton Nest, based in Sector 46 Gurgaon, we started with a simple belief: bedsheets should never be made with sweaty synthetic microfiber or shrunk down to stingy sizes that untuck the moment you turn in bed.",
    paragraph2: "Every single bedsheet in our collection is cut to an expansive King size (108×108 / 100×108 inch), guaranteeing a generous tuck-in under even the thickest modern orthopaedic mattresses.",
    pillar1Title: "100% Natural Breathable Cotton",
    pillar1Desc: "Zero polyester blends. Completely breathable and cool against the skin during Indian summers.",
    pillar2Title: "No Untucking Generous Drop",
    pillar2Desc: "Expansive 108×108 inch proportion ensures mattress corners remain neatly tucked all night.",
    pillar3Title: "Color-Fast Reactive Inks",
    pillar3Desc: "Wash after domestic wash, florals and geometric linework retain their rich clarity.",
    pillar4Title: "Gurgaon Local Studio Reassurance",
    pillar4Desc: "Direct support, prompt exchange assistance, and open touch-and-feel visits in Sector 46.",
  },
  termsAndConditions: `🌸 COTTON NEST – TERMS & CONDITIONS
By placing an order with Cotton Nest, the customer acknowledges that they have read, understood, and agreed to the following Terms & Conditions.

PRODUCT REPRESENTATION
•• Product photographs are for illustrative purposes only.
•• Actual colours, shades, prints, patterns, stitching, fabric texture, and finish may vary from photographs due to lighting conditions, photography techniques, screen resolutions, display settings, manufacturing batches, and fabric dyeing processes.
•• Such variations shall not constitute a defect, misrepresentation, or grounds for cancellation, return, exchange, refund, compensation, or legal claim.
________________________________________
ORDER ACCEPTANCE
•• All orders are subject to acceptance and product availability.
•• Cotton Nest reserves the right to refuse, cancel, or limit any order at its sole discretion without providing a reason.
•• Acceptance of payment does not guarantee acceptance of an order.
________________________________________
PRICING
•• Prices displayed are subject to change without prior notice.
•• In case of technical, pricing, listing, cataloguing, or typographical errors, Cotton Nest reserves the right to cancel the order and refund any payment received.
________________________________________
SHIPPING & DELIVERY
Gurgaon
•• Sector 46 Gurgaon: Complimentary Delivery.
•• Other Gurgaon Locations: Self Pickup or Actual Delivery Charges.
Rest of India
•• Flat ₹29 Across India (shipping charges applied at order placement: ₹29).
General Conditions
•• Delivery timelines are estimates and not guaranteed.
•• Cotton Nest shall not be responsible for delays caused by courier companies, weather conditions, transportation disruptions, strikes, natural disasters, government restrictions, force majeure events, or circumstances beyond reasonable control.
•• Risk and ownership of products pass to the customer upon successful delivery to the shipping address provided at checkout.
•• Cotton Nest shall not be liable for incorrect addresses, failed delivery attempts, customer unavailability, or shipment delays caused by inaccurate customer information.
________________________________________
EXCHANGE POLICY
Manufacturing Defects Only
Exchange requests will only be considered for genuine manufacturing defects.
The customer must:
•• Notify Cotton Nest within 48 hours of delivery.
•• Provide clear photographs and an uninterrupted unboxing video.
•• Retain original packaging, tags, labels, and invoice.
•• Ensure the product remains unused, unwashed, and unaltered.
Exchange Approval
•• Submission of an exchange request does not guarantee approval.
•• Cotton Nest reserves the sole and absolute right to determine whether a reported issue constitutes a manufacturing defect.
•• The decision of Cotton Nest regarding defect assessment shall be final and binding.
________________________________________
NON-EXCHANGEABLE CONDITIONS
The following shall not qualify for exchange, refund, or compensation:
•• Colour variation due to lightening effects.
•• Difference in screen display.
•• Print alignment variation.
•• Minor stitching irregularities.
•• Fabric texture variation.
•• Customer preference changes.
•• Change of mind after purchase.
•• Incorrect selection by customer.
•• Washing damage.
•• Shrinkage resulting from improper care.
•• Damage caused by misuse, negligence, pets, children, or external factors.
•• Normal wear and tear.
________________________________________
RETURNS
•• Cotton Nest does not accept returns unless expressly approved under the Manufacturing Defect Policy.
•• Unauthorized returns will not be accepted and may be returned to the sender at the sender's expense.
________________________________________
REFUNDS
•• No cash refund shall be provided under any circumstances.
•• Where approved by Cotton Nest, store credit may be issued instead of replacement.
•• Store credits:
o Are non-transferable.
o Cannot be redeemed for cash.
o Cannot be extended beyond their validity period.
o Must be utilized within 60 days of issuance.
________________________________________
LIMITATION OF LIABILITY
•• To the maximum extent permitted by applicable law, Cotton Nest's total liability arising from any transaction shall not exceed the purchase price actually paid by the customer for the affected product.
•• Cotton Nest shall not be liable for any indirect, incidental, consequential, punitive, special, or exemplary damages, including but not limited to loss of income, business interruption, emotional distress, reputational loss, inconvenience, or loss of opportunity.
________________________________________
FORCE MAJEURE
Cotton Nest shall not be held liable for any failure or delay in performance resulting from causes beyond its reasonable control, including but not limited to:
•• Natural disasters
•• Floods
•• Fire
•• Pandemics
•• Epidemics
•• Government actions
•• Transportation disruptions
•• Labour disputes
•• Technical failures
•• Power outages
•• Internet interruptions
________________________________________
FRAUD PREVENTION
•• Cotton Nest reserves the right to refuse service, cancel orders, restrict transactions, or suspend customer accounts where suspicious, abusive, fraudulent, or unlawful activity is suspected.
•• Legal action may be initiated where necessary.
________________________________________
DISPUTE RESOLUTION
•• Customers agree to first contact Cotton Nest and provide a reasonable opportunity to resolve any dispute amicably.
•• Any dispute arising from the purchase of products shall be governed by the laws of India.
________________________________________
JURISDICTION
All disputes, claims, or proceedings arising from transactions with Cotton Nest shall be subject exclusively to the jurisdiction of the competent courts located in Gurugram, Haryana, India.
________________________________________
🔒 Privacy & Customer Information
•• Customer information collected for order fulfillment, delivery, payment processing, customer support, and related business purposes will be treated as confidential and handled in accordance with applicable laws.
•• Cotton Nest will not sell, rent, trade, or knowingly disclose customer personal information to any third party except:
o Service providers involved in order processing, shipping, payment processing, or customer support;
o Government authorities, regulatory bodies, law enforcement agencies, or courts where disclosure is required by law;
o Such other parties as may be necessary to protect the legal rights, property, or safety of Cotton Nest, its customers, or the public.
•• Customers are responsible for providing accurate, complete, and up-to-date information at the time of order placement. Cotton Nest shall not be liable for delays, failed deliveries, additional charges, or losses arising from incorrect customer information.
•• While Cotton Nest takes reasonable measures to safeguard customer information, no method of electronic transmission or storage can be guaranteed as completely secure. By using our services, customers acknowledge and accept such inherent risks.
•• Cotton Nest reserves the right to maintain transactional records, communications, and order details for accounting, operational, dispute resolution, fraud prevention, and legal compliance purposes.
•• Promotional messages, updates, offers, and order-related communications may be sent via WhatsApp, SMS, email, or phone call. Customers may opt out of promotional communications at any time; however, transactional communications relating to orders, deliveries, payments, or customer service may still be sent.
•• By placing an order with Cotton Nest, the customer consents to the collection, storage, processing, and use of their information for legitimate business purposes related to the purchase and delivery of products.
•• Cotton Nest reserves the right to amend its Privacy Policy and Terms & Conditions at any time without prior notice. Continued use of our services after such changes constitutes acceptance of the revised terms.
________________________________________
🎁 LOYALTY REWARDS & NEST POINTS TERMS
1. Earning Nest Points
•• Customers earn 5 Nest Points for every ₹100 spent on pure cotton bedsheets and bedding.
•• Points are credited only after successful delivery and full payment.
•• No Nest Points are awarded on delivery charges.
•• Nest Points expire 12 months from the date of credit.

2. Loyalty Points Redemption
•• 2 Nest Points = ₹1 discount at checkout.
•• A minimum of 200 Nest Points is required to redeem points (₹100 discount).
•• Customers can redeem a maximum of 250 Nest Points per order, equivalent to a maximum discount of ₹125.
•• The maximum redemption limit applies to each individual order.
•• Any unused Nest Points will remain in the customer's account for future purchases.
•• Nest Points cannot be exchanged for cash or transferred to another account.
•• Redemption is subject to sufficient available Nest Points in the customer's account.

Loyalty Points Redemption – Additional Terms & Conditions
1. Nest Points can only be redeemed by the registered customer account to which they were originally credited.
2. Points cannot be transferred, exchanged for cash, or redeemed outside the Cotton Nest website.
3. Redemption is permitted only on eligible purchases and cannot be combined with any excluded promotional offers unless explicitly allowed by Cotton Nest.
4. The maximum Nest Points redemption limit is 125 points per order.
5. Customers must have sufficient available points at the time of checkout. Points already redeemed cannot be reused.
6. Once an order is successfully placed using Nest Points, the redeemed points will be deducted from the customer's available balance.
7. If an order is cancelled or refunded, the redeemed points will be returned to the customer's account, subject to order and refund verification.
8. Cotton Nest reserves the right to reverse points credited through incorrect calculations, fraudulent transactions, or cancelled/returned purchases.
9. Nest Points have no independent cash value and cannot be transferred to another account.
10. Cotton Nest reserves the right to modify or discontinue the loyalty programme with reasonable notice.`,
};
