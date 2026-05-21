import { type Invoice } from "@/src/services/invoices";

export function formatCurrency(amount: number, currency: string = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  } catch (e) {
    console.warn("Currency formatting error:", e);
    return `${currency || "USD"} ${amount || 0}`;
  }
}

export function formatDisplayDate(dateString: string | null): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Invalid Date";
    
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch (e) {
    console.warn("Date formatting error:", e);
    return dateString;
  }
}


export function getInvoiceMetrics(invoices: Invoice[]) {
  if (!Array.isArray(invoices)) {
    return {
      total: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
      pendingCount: 0,
      overdueCount: 0,
      draftCount: 0,
    };
  }

  return invoices.reduce(
    (accumulator, invoice) => {
      const amount = invoice.amount || 0;
      accumulator.total += amount;

      if (invoice.status === "paid") {
        accumulator.paid += amount;
      }

      if (invoice.status === "pending") {
        accumulator.pending += amount;
        accumulator.pendingCount += 1;
      }

      if (invoice.status === "overdue") {
        accumulator.overdue += amount;
        accumulator.overdueCount += 1;
      }

      if (invoice.status === "draft") {
        accumulator.draftCount += 1;
      }

      return accumulator;
    },
    {
      total: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
      pendingCount: 0,
      overdueCount: 0,
      draftCount: 0,
    }
  );
}
