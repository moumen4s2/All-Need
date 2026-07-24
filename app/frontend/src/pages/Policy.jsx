import React from "react";

const CONTENT = {
  privacy: {
    title: "Privacy Policy",
    body: [
      ["Introduction", "AllNeeds ('we', 'us') is committed to protecting your privacy. This policy explains how we collect, use and safeguard your personal information when you shop with us."],
      ["Information We Collect", "We collect information you provide at checkout — such as your name, email, phone number and shipping address — as well as usage data to improve your experience."],
      ["How We Use Your Data", "Your data is used to process orders, arrange delivery across the UAE, provide customer support and, with your consent, send newsletters and offers."],
      ["Data Security", "We use secure, encrypted checkout and never store full payment card details on our servers. Payments are processed by trusted, PCI-compliant providers."],
      ["Your Rights", "You may request access to, correction of, or deletion of your personal data at any time by contacting hello@allneeds.ae."],
    ],
  },
  returns: {
    title: "Return Policy",
    body: [
      ["14-Day Returns", "We offer hassle-free returns within 14 days of delivery on all unused items in their original, undamaged packaging."],
      ["How to Return", "Contact our support team at hello@allneeds.ae with your order number. We'll arrange a convenient pickup across the UAE."],
      ["Refunds", "Once your return is received and inspected, refunds are processed to your original payment method within 5–7 business days."],
      ["Non-Returnable Items", "For hygiene reasons, opened feeding accessories, used swim products and personalised items cannot be returned."],
      ["Damaged or Faulty Items", "If your item arrives damaged or faulty, contact us within 48 hours for a free replacement or full refund."],
    ],
  },
  terms: {
    title: "Terms & Conditions",
    body: [
      ["Agreement", "By using the AllNeeds website and placing an order, you agree to these terms and conditions in full."],
      ["Orders & Pricing", "All prices are listed in UAE Dirham (AED) and include applicable taxes. We reserve the right to correct pricing errors."],
      ["Shipping", "We ship exclusively within the United Arab Emirates. Delivery times are estimates and may vary by location."],
      ["Product Information", "We strive for accuracy in product descriptions and images. Slight variations in colour may occur due to screen settings."],
      ["Limitation of Liability", "AllNeeds is not liable for indirect damages arising from product use. Always follow manufacturer safety guidance."],
      ["Governing Law", "These terms are governed by the laws of the United Arab Emirates."],
    ],
  },
};

export const Policy = ({ type }) => {
  const c = CONTENT[type];
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16" data-testid={`policy-${type}`}>
      <h1 className="text-4xl sm:text-5xl font-bold mb-3">{c.title}</h1>
      <p className="text-sm text-slate-400 mb-10">Last updated: June 2026</p>
      <div className="space-y-8">
        {c.body.map(([h, p], i) => (
          <section key={i}>
            <h2 className="font-display font-semibold text-xl mb-2">{h}</h2>
            <p className="text-slate-600 leading-relaxed">{p}</p>
          </section>
        ))}
      </div>
    </div>
  );
};
