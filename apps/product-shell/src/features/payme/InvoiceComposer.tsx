import { useState } from "react";
import { useParams } from "react-router-dom";

type RouteParams = { designation?: string; slug?: string };

function autoInvoiceNumber(): string {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `INV-${date}-${rand}`;
}

function esc(v: string): string {
  return String(v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] ?? c));
}

function buildPaymentLink(invoiceNumber: string, amount: string, subject: string, slug?: string, designation?: string): string {
  const seg = designation && slug ? `/${designation}/${slug}` : slug ? `/${slug}` : "";
  const p = new URLSearchParams();
  if (invoiceNumber) p.set("inv", invoiceNumber);
  if (amount) p.set("amt", amount);
  if (subject) p.set("subj", subject);
  return `${window.location.origin}${seg}/payme?${p.toString()}`;
}

function buildPrintHtml(invoiceNumber: string, amount: string, subject: string, notes: string, paymentLink: string): string {
  const dateStr = new Date().toLocaleDateString();
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Invoice ${esc(invoiceNumber)}</title>
<style>
*{box-sizing:border-box}
body{font-family:Arial,sans-serif;color:#0f172a;max-width:820px;margin:0 auto;padding:40px 32px}
.header{display:flex;justify-content:space-between;align-items:flex-start;gap:24px}
.h-title{font-size:30px;font-weight:900;color:#2f7df6;letter-spacing:2px}
.h-meta{text-align:right;min-width:200px}
.h-meta div{margin-top:6px;font-size:14px}
.section{margin-top:24px;padding:16px;border:1px solid #e5ebf2;border-radius:10px}
.section-title{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#64748b;margin-bottom:12px}
.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:14px}
.row:last-child{border-bottom:none}
.lbl{color:#64748b}
.val{font-weight:700}
.notes-body{white-space:pre-wrap;font-size:14px;line-height:1.6;color:#1e293b;margin-top:6px}
.pay-section{margin-top:24px;padding:16px;background:#eef5ff;border-radius:10px}
.pay-label{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#1d4ed8;margin-bottom:8px}
.pay-link{word-break:break-all;color:#2f7df6;font-size:13px}
.footer{margin-top:32px;font-size:11px;color:#94a3b8;text-align:center}
@media print{@page{margin:0.8in}body{padding:0}}
</style></head><body>
<div class="header">
  <div class="h-title">INVOICE</div>
  <div class="h-meta">
    <div><span style="opacity:.7">Invoice #</span> <b>${esc(invoiceNumber || "—")}</b></div>
    <div><span style="opacity:.7">Date</span> <b>${esc(dateStr)}</b></div>
    <div style="margin-top:10px;font-size:18px;font-weight:900;color:#2f7df6">$${esc(amount || "0")}</div>
  </div>
</div>
<div class="section">
  <div class="section-title">Invoice Details</div>
  <div class="row"><span class="lbl">Subject</span><span class="val">${esc(subject || "—")}</span></div>
  ${notes ? `<div class="row" style="flex-direction:column;gap:4px"><span class="lbl">Notes</span><div class="notes-body">${esc(notes)}</div></div>` : ""}
</div>
${paymentLink ? `<div class="pay-section"><div class="pay-label">Payment Link</div><a href="${esc(paymentLink)}" class="pay-link">${esc(paymentLink)}</a></div>` : ""}
<div class="footer">Generated ${esc(dateStr)} &mdash; Share this invoice via email or text</div>
</body></html>`;
}

export function InvoiceComposer() {
  const { designation, slug } = useParams<RouteParams>();
  const [invoiceNumber, setInvoiceNumber] = useState(autoInvoiceNumber);
  const [amount, setAmount] = useState("");
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [copied, setCopied] = useState(false);

  function generateLink() {
    const link = buildPaymentLink(invoiceNumber, amount, subject, slug, designation);
    setPaymentLink(link);
  }

  function copyLink() {
    navigator.clipboard.writeText(paymentLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openPdf() {
    const html = buildPrintHtml(invoiceNumber, amount, subject, notes, paymentLink);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 350);
  }

  const ready = Boolean(invoiceNumber.trim() && amount.trim());

  return (
    <div className="paymeSubGrid">
      <div className="adminBlock" style={{ gridColumn: "span 2" }}>
        <div className="adminBlockTitle">Compose Invoice</div>
        <div className="adminBlockBody">
          <div className="paymeFormGrid">
            <label>
              <span className="paymeLabel">Invoice Number</span>
              <input
                className="adminTextInput"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-20260101-0001"
                style={{ width: "100%" }}
              />
            </label>
            <label>
              <span className="paymeLabel">Amount ($)</span>
              <input
                className="adminTextInput"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                style={{ width: "100%" }}
              />
            </label>
            <div />
            <label style={{ gridColumn: "span 3" }}>
              <span className="paymeLabel">Subject</span>
              <input
                className="adminTextInput"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Website design — April 2026"
                style={{ width: "100%" }}
              />
            </label>
            <label style={{ gridColumn: "span 3" }}>
              <span className="paymeLabel">Notes</span>
              <textarea
                className="adminTextInput"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment terms, special instructions, or any additional details for the recipient."
                rows={4}
                style={{ width: "100%", resize: "vertical" }}
              />
            </label>
          </div>
          <div className="adminActions" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="adminBtn primary"
              onClick={generateLink}
              disabled={!ready}
            >
              Generate Payment Link
            </button>
            <button
              type="button"
              className="adminBtn"
              onClick={openPdf}
              disabled={!ready}
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {paymentLink && (
        <div className="adminBlock" style={{ gridColumn: "span 2" }}>
          <div className="adminBlockTitle">Payment Link</div>
          <div className="adminBlockBody">
            <div className="invoiceLinkBox">
              <span className="invoiceLinkText">{paymentLink}</span>
              <button type="button" className="adminBtn" onClick={copyLink} style={{ flexShrink: 0 }}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.65 }}>
              Share via email or text. Recipient follows the link to complete payment.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
