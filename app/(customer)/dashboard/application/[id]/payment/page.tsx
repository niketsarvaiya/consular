"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Shield, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

interface OrderData {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  breakdown: { governmentFee: number; serviceFee: number; taxes: number; total: number };
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    // Load customer details
    fetch("/api/applications/" + id).then((r) => r.json()).then((data) => {
      if (data.success) {
        setCustomerName(data.data.customer?.fullName ?? "");
        setCustomerEmail(data.data.customer?.email ?? "");
        // If already paid
        if (data.data.paymentOrder?.status === "PAID") setPaid(true);
      }
    });
    // Load Razorpay SDK
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);
  }, [id]);

  const createOrder = async () => {
    setCreating(true);
    setError("");
    const res = await fetch(`/api/applications/${id}/payment`, { method: "POST" });
    const data = await res.json();
    setCreating(false);
    if (!data.success) { setError(data.error ?? "Failed to create order."); return; }
    setOrder(data.data);
  };

  const handlePay = () => {
    if (!order) return;
    setLoading(true);

    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: "Consular",
      description: "Visa Application Fee",
      prefill: { name: customerName, email: customerEmail },
      theme: { color: "#0f172a" },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        const verifyData = await verifyRes.json();
        setLoading(false);
        if (verifyData.success) { setPaid(true); setTimeout(() => router.push(`/dashboard/application/${id}`), 2000); }
        else setError("Payment verification failed. Please contact support.");
      },
      modal: { ondismiss: () => setLoading(false) },
    });

    rzp.open();
  };

  if (paid) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Payment successful!</h1>
          <p className="mt-2 text-slate-500">Your application is now being processed. We'll keep you updated.</p>
          <Link href={`/dashboard/application/${id}`} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Track application
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <Link href={`/dashboard/application/${id}`} className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to application
      </Link>

      <h1 className="text-2xl font-semibold text-slate-900">Complete payment</h1>
      <p className="mt-2 text-sm text-slate-500">Your documents have been approved. Pay to confirm your application.</p>

      {error && <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {!order ? (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm text-slate-500">Click below to generate your payment order and see the exact fee breakdown.</p>
          <button onClick={createOrder} disabled={creating} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
            {creating && <Loader2 className="h-4 w-4 animate-spin" />}
            View fee breakdown
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Fee breakdown</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600"><span>Government fee</span><span>₹{order.breakdown.governmentFee.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between text-slate-600"><span>Service fee</span><span>₹{order.breakdown.serviceFee.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between text-slate-600"><span>GST (18%)</span><span>₹{order.breakdown.taxes.toLocaleString("en-IN")}</span></div>
              <hr className="border-slate-100" />
              <div className="flex justify-between font-semibold text-slate-900">
                <span>Total</span>
                <span>₹{order.breakdown.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
            <Shield className="h-4 w-4 shrink-0 text-slate-400" />
            Secured by Razorpay. UPI, cards, net banking, and wallets accepted.
          </div>

          <button onClick={handlePay} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Pay ₹{order.breakdown.total.toLocaleString("en-IN")}
          </button>

          <p className="text-center text-xs text-slate-400">Visa approval is at embassy discretion. Payment is non-refundable once the application is filed.</p>
        </div>
      )}
    </div>
  );
}
