import { type Invoice } from "@/src/services/invoices";
import { formatCurrency, formatDisplayDate } from "@/src/data/invoices";

export function generateInvoiceHtml(invoice: Invoice): string {
  const itemsHtml = invoice.items
    ?.map(
      (item) => `
      <tr class="item-row">
        <td>${escapeHtml(item.name)}</td>
        <td class="text-center">${item.qty}</td>
        <td class="text-right">${formatCurrency(item.price, invoice.currency)}</td>
        <td class="text-right">${formatCurrency(item.total, invoice.currency)}</td>
      </tr>
    `
    )
    .join("") || "";

  const statusColors = {
    paid: { bg: "#E7F7EE", text: "#1F8F5F" },
    pending: { bg: "#FFF3D9", text: "#B7791F" },
    overdue: { bg: "#FFE5DF", text: "#C24E32" },
    draft: { bg: "#EEF2F6", text: "#5F6B7A" },
  };

  const status = invoice.status || "pending";
  const colors = statusColors[status] || statusColors.pending;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice._id}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 40px;
          font-size: 14px;
          line-height: 1.5;
          background: #ffffff;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 24px;
        }

        .brand h1 {
          font-size: 28px;
          font-weight: 800;
          color: #10b981; /* Emerald green accent */
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }

        .brand p {
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        .meta-info {
          text-align: right;
        }

        .meta-info h2 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: #0f172a;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 14px;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          border-radius: 6px;
          background-color: ${colors.bg};
          color: ${colors.text};
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }

        .meta-details {
          font-size: 13px;
          color: #64748b;
        }

        .meta-details div {
          margin-bottom: 4px;
        }

        .meta-details strong {
          color: #334155;
        }

        .billing-grid {
          display: flex;
          gap: 40px;
          margin-bottom: 40px;
        }

        .billing-col {
          flex: 1;
        }

        .billing-col h3 {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #94a3b8;
          margin: 0 0 10px 0;
          font-weight: 800;
        }

        .billing-col p {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }

        .billing-col .email {
          color: #64748b;
          font-weight: 400;
          font-size: 14px;
          margin-top: 4px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }

        th {
          background: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #475569;
          text-align: left;
        }

        td {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          font-size: 14px;
        }

        .item-row:nth-child(even) {
          background-color: #f8fafc;
        }

        .text-center {
          text-align: center;
        }

        .text-right {
          text-align: right;
        }

        .summary-container {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 40px;
        }

        .summary-table {
          width: 300px;
          margin-bottom: 0;
        }

        .summary-table td {
          padding: 10px 16px;
          border: none;
        }

        .summary-table tr:not(:last-child) td {
          border-bottom: 1px dashed #e2e8f0;
        }

        .summary-table .total-row td {
          background: #f8fafc;
          border-radius: 6px;
          font-weight: 800;
          font-size: 18px;
          color: #0f172a;
          border: 1.5px solid #10b981;
          padding: 14px 16px;
        }

        .notes-section {
          background: #f8fafc;
          border-left: 4px solid #cbd5e1;
          border-radius: 6px;
          padding: 18px 22px;
          margin-bottom: 30px;
        }

        .notes-section h4 {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #475569;
          margin: 0 0 8px 0;
          font-weight: 700;
        }

        .notes-section p {
          margin: 0;
          color: #475569;
          line-height: 1.6;
          font-size: 13px;
        }

        .stripe-banner {
          background: linear-gradient(135deg, #635bff 0%, #4f46e5 100%);
          border-radius: 8px;
          padding: 20px 24px;
          color: #ffffff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          box-shadow: 0 4px 12px rgba(99, 91, 255, 0.15);
        }

        .stripe-banner-content h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 700;
        }

        .stripe-banner-content p {
          margin: 0;
          font-size: 13px;
          color: #e0e7ff;
          font-weight: 500;
        }

        .stripe-button {
          background: #ffffff;
          color: #635bff;
          text-decoration: none;
          padding: 10px 18px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 13px;
          transition: background 0.15s ease;
          display: inline-block;
        }

        .footer {
          text-align: center;
          color: #94a3b8;
          font-size: 12px;
          margin-top: 60px;
          border-top: 1px solid #f1f5f9;
          padding-top: 24px;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">
          <h1>INVOICER</h1>
          <p>Secure Professional Billing</p>
        </div>
        <div class="meta-info">
          <div class="status-badge">${status}</div>
          <h2>Invoice #${invoice._id.slice(-8).toUpperCase()}</h2>
          <div class="meta-details">
            <div><strong>Issued:</strong> ${formatDisplayDate(invoice.issueDate || invoice.createdAt)}</div>
            <div><strong>Due Date:</strong> ${formatDisplayDate(invoice.dueDate)}</div>
          </div>
        </div>
      </div>

      <div class="billing-grid">
        <div class="billing-col">
          <h3>Billed To</h3>
          <p>${escapeHtml(invoice.clientName)}</p>
          <div class="email">${escapeHtml(invoice.clientEmail)}</div>
        </div>
        <div class="billing-col">
          <h3>Billed From</h3>
          <p>My Company Inc.</p>
          <div class="email">billing@mycompany.com</div>
        </div>
      </div>

      ${
        invoice.stripePaymentLink && status !== "paid"
          ? `
          <div class="stripe-banner">
            <div class="stripe-banner-content">
              <h4>Pay Securely Online</h4>
              <p>Instantly process your payment using Stripe Credit Card checkout.</p>
            </div>
            <a href="${invoice.stripePaymentLink}" class="stripe-button" target="_blank">Pay Invoice</a>
          </div>
          `
          : ""
      }

      <table>
        <thead>
          <tr>
            <th style="width: 50%;">Item</th>
            <th class="text-center" style="width: 10%;">Qty</th>
            <th class="text-right" style="width: 20%;">Price</th>
            <th class="text-right" style="width: 20%;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="summary-container">
        <table class="summary-table">
          <tr>
            <td class="text-right" style="color: #64748b;">Subtotal</td>
            <td class="text-right" style="font-weight: 600;">${formatCurrency(invoice.amount, invoice.currency)}</td>
          </tr>
          <tr class="total-row">
            <td class="text-right">Total Due</td>
            <td class="text-right">${formatCurrency(invoice.amount, invoice.currency)}</td>
          </tr>
        </table>
      </div>

      ${
        invoice.description
          ? `
          <div class="notes-section" style="border-left-color: #10b981;">
            <h4>Invoice Description</h4>
            <p>${escapeHtml(invoice.description)}</p>
          </div>
          `
          : ""
      }

      ${
        invoice.additionalNotes
          ? `
          <div class="notes-section">
            <h4>Additional Notes</h4>
            <p>${escapeHtml(invoice.additionalNotes)}</p>
          </div>
          `
          : ""
      }

      <div class="footer">
        <p>Thank you for your business!</p>
        <p style="font-size: 10px; margin-top: 6px; color: #cbd5e1;">Generated electronically on ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
