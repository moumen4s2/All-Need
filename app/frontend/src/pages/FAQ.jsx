import React from "react";
import { useApp } from "@/context/AppContext";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const FAQS = {
  en: [
    ["Do you deliver across the UAE?", "Yes! We deliver to all seven emirates with reliable next-day delivery on most orders and full delivery tracking."],
    ["What payment methods do you accept?", "We accept Visa, Mastercard, Apple Pay and Google Pay through a secure checkout."],
    ["Are your products safe for babies?", "Absolutely. Every product is BPA-free, non-toxic and meets international safety standards."],
    ["What is your return policy?", "We offer hassle-free 14-day returns on all unused items in their original packaging."],
    ["How can I track my order?", "Use the Track Order page with the tracking number sent to you after checkout."],
    ["Do you offer discounts?", "Yes — subscribe to our newsletter for exclusive offers, and try codes like ALLNEEDS10 or BABY20 at checkout."],
  ],
  ar: [
    ["هل توصلون لجميع أنحاء الإمارات؟", "نعم! نوصل لجميع الإمارات السبع مع توصيل موثوق في اليوم التالي لمعظم الطلبات وتتبع كامل."],
    ["ما طرق الدفع المقبولة؟", "نقبل فيزا وماستركارد وآبل باي وجوجل باي عبر دفع آمن."],
    ["هل منتجاتكم آمنة للأطفال؟", "بالتأكيد. كل منتج خالٍ من BPA وغير سام ويلبي معايير السلامة الدولية."],
    ["ما هي سياسة الإرجاع؟", "نوفر إرجاعاً سهلاً خلال 14 يوماً لجميع المنتجات غير المستخدمة بعبوتها الأصلية."],
    ["كيف أتتبع طلبي؟", "استخدم صفحة تتبع الطلب برقم التتبع المُرسل إليك بعد الشراء."],
    ["هل تقدمون خصومات؟", "نعم — اشترك في نشرتنا للعروض الحصرية، وجرّب أكواد مثل ALLNEEDS10 أو BABY20 عند الدفع."],
  ],
};

export const FAQ = () => {
  const { t, lang } = useApp();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 min-h-[60vh]" data-testid="faq-page">
      <div className="text-center mb-12"><span className="overline text-[11px] text-slate-500">{t.nav.faq}</span><h1 className="text-4xl sm:text-5xl font-bold mt-2">{lang === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions"}</h1></div>
      <Accordion type="single" collapsible className="space-y-3">
        {FAQS[lang].map(([q, a], i) => (
          <AccordionItem key={i} value={`item-${i}`} className="bg-white rounded-2xl px-6 border-none card-shadow" data-testid={`faq-item-${i}`}>
            <AccordionTrigger className="text-start font-display font-medium hover:no-underline py-5">{q}</AccordionTrigger>
            <AccordionContent className="text-slate-600 leading-relaxed pb-5">{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
