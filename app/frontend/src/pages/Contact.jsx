import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const Contact = () => {
  const { t } = useApp();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/contact", form); toast.success(t.contact.sent); setForm({ name: "", email: "", subject: "", message: "" }); }
    catch { toast.error("Please check your details"); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16" data-testid="contact-page">
      <div className="mb-12 max-w-xl"><span className="overline text-[11px] text-slate-500">{t.nav.contact}</span><h1 className="text-4xl sm:text-5xl font-bold mt-2 mb-3">{t.contact.title}</h1><p className="text-slate-600">{t.contact.sub}</p></div>
      <div className="grid lg:grid-cols-[1fr_360px] gap-10">
        <form onSubmit={submit} className="space-y-5" data-testid="contact-form">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label={t.contact.name} value={form.name} onChange={set("name")} testid="contact-name" required />
            <Field label={t.contact.email} type="email" value={form.email} onChange={set("email")} testid="contact-email" required />
          </div>
          <Field label={t.contact.subject} value={form.subject} onChange={set("subject")} testid="contact-subject" required />
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">{t.contact.message}</label>
            <textarea value={form.message} onChange={set("message")} rows={6} className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900 resize-none" data-testid="contact-message" required />
          </div>
          <button type="submit" className="bg-slate-900 text-white rounded-full px-8 py-3.5 font-semibold hover:bg-slate-800 transition-colors" data-testid="contact-submit">{t.contact.send}</button>
        </form>
        <div className="space-y-5">
          {[[MapPin, t.contact.office, "Dubai, United Arab Emirates"], [Phone, "Phone", "+971 4 000 0000"], [Mail, "Email", "hello@allneeds.ae"], [Clock, t.contact.hours, t.contact.hoursVal]].map(([Icon, label, val], i) => (
            <div key={i} className="flex items-start gap-4 bg-white rounded-2xl p-5 card-shadow">
              <div className="w-11 h-11 rounded-full bg-[var(--sand-soft)] flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-slate-700" strokeWidth={1.5} /></div>
              <div><p className="text-sm text-slate-500">{label}</p><p className="font-medium">{val}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, testid, ...props }) => (
  <div>
    <label className="text-sm font-medium text-slate-700 mb-1.5 block">{label}</label>
    <input {...props} data-testid={testid} className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900" />
  </div>
);
