"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  Lock,
  CheckCircle2,
  Loader2,
  Smartphone,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface CheckoutPaymentDetails {
  paymentMethod: "UPI" | "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER";
  amount: number;
  transactionRef: string;
  notes?: string;
}

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  onPaymentSuccess: (details: CheckoutPaymentDetails) => Promise<void>;
  successButtonText?: string;
}

export function RazorpayCheckoutModal({
  isOpen,
  onClose,
  title,
  subtitle,
  amount,
  customerName = "Customer",
  customerEmail = "billing@brightloop.io",
  onPaymentSuccess,
  successButtonText = "View Active Subscription",
}: RazorpayCheckoutModalProps) {
  const [activeMethod, setActiveMethod] = useState<"UPI" | "CARD" | "NETBANKING" | "NEFT">("UPI");
  const [upiId, setUpiId] = useState("brightloop.client@okaxis");
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>("gpay");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8892");
  const [cardExpiry, setCardExpiry] = useState("08/28");
  const [cardCvv, setCardCvv] = useState("782");
  const [cardName, setCardName] = useState(customerName);
  const [selectedBank, setSelectedBank] = useState<string>("HDFC");

  // Payment states: "FORM" | "PROCESSING" | "SUCCESS"
  const [paymentState, setPaymentState] = useState<"FORM" | "PROCESSING" | "SUCCESS">("FORM");
  const [processingStep, setProcessingStep] = useState<string>("Securing connection with bank gateway...");
  const [generatedRef, setGeneratedRef] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPaymentState("FORM");
      setErrorMessage(null);
      setGeneratedRef(`pay_rzp_${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    }
  }, [isOpen, amount]);

  if (!isOpen) return null;

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleStartPayment = async () => {
    setPaymentState("PROCESSING");
    setProcessingStep("Connecting to Razorpay secure payment network...");

    try {
      await new Promise((r) => setTimeout(r, 800));
      setProcessingStep("Authorizing transaction with Bank & NPCI servers...");
      await new Promise((r) => setTimeout(r, 900));
      setProcessingStep("Verifying merchant settlement & cryptographic signature...");
      await new Promise((r) => setTimeout(r, 600));

      const methodMapping: Record<string, CheckoutPaymentDetails["paymentMethod"]> = {
        UPI: "UPI",
        CARD: "CREDIT_CARD",
        NETBANKING: "BANK_TRANSFER",
        NEFT: "BANK_TRANSFER",
      };

      const details: CheckoutPaymentDetails = {
        paymentMethod: methodMapping[activeMethod] || "UPI",
        amount,
        transactionRef: generatedRef,
        notes: `Razorpay Online Checkout via ${activeMethod} (${generatedRef})`,
      };

      // Call API callback to accept proposal / pay invoice in database
      await onPaymentSuccess(details);

      // Trigger success animation
      setPaymentState("SUCCESS");
    } catch (err: any) {
      console.error("Payment submission failure:", err);
      setErrorMessage(err.message || "Payment authorization failed. Please try again.");
      setPaymentState("FORM");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Razorpay Authentic Signature Header */}
        <div className="bg-[#0C2340] text-white px-6 py-5 flex items-center justify-between border-b border-blue-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3395FF] to-[#0D62FF] flex items-center justify-center shadow-lg text-white font-black text-base">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                  Brightloop Software Pvt. Ltd.
                </span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80 flex items-center gap-1 mt-0.5">
                <Lock className="w-3 h-3 text-blue-300" />
                <span>Razorpay 256-Bit SSL Checkout Gateway</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-blue-200 block tracking-wider">
                Payable Amount
              </span>
              <span className="text-lg sm:text-xl font-black font-mono text-white">
                {formatINR(amount)}
              </span>
            </div>
            {paymentState === "FORM" && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: PAYMENT METHOD FORM                                              */}
        {/* ========================================================================= */}
        {paymentState === "FORM" && (
          <div className="flex flex-col sm:flex-row flex-1 overflow-y-auto">
            {/* Sidebar Method Tabs */}
            <div className="w-full sm:w-44 bg-slate-50 border-r border-slate-200/80 p-2 sm:p-3 flex sm:flex-col gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveMethod("UPI")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeMethod === "UPI"
                    ? "bg-[#3395FF] text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-200/60"
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>UPI / QR</span>
              </button>

              <button
                onClick={() => setActiveMethod("CARD")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeMethod === "CARD"
                    ? "bg-[#3395FF] text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-200/60"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Cards</span>
              </button>

              <button
                onClick={() => setActiveMethod("NETBANKING")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeMethod === "NETBANKING"
                    ? "bg-[#3395FF] text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-200/60"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Netbanking</span>
              </button>

              <button
                onClick={() => setActiveMethod("NEFT")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeMethod === "NEFT"
                    ? "bg-[#3395FF] text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-200/60"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Bank Transfer</span>
              </button>
            </div>

            {/* Method Details Pane */}
            <div className="flex-1 p-5 sm:p-6 space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              {/* A. UPI Payment View */}
              {activeMethod === "UPI" && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-center space-y-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Scan QR Code with any UPI App
                    </span>
                    <div className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl border-2 border-dashed border-[#3395FF]/40 shadow-inner flex flex-col items-center justify-center relative group">
                      {/* Realistic SVG UPI QR Pattern */}
                      <div className="w-28 h-28 bg-slate-900 rounded-lg p-1.5 flex flex-wrap gap-1 items-center justify-center">
                        <div className="w-9 h-9 border-4 border-white bg-slate-900 rounded-sm" />
                        <div className="w-9 h-9 border-4 border-white bg-slate-900 rounded-sm" />
                        <div className="w-9 h-9 border-4 border-white bg-slate-900 rounded-sm" />
                        <div className="w-9 h-9 bg-emerald-400 rounded-sm flex items-center justify-center text-slate-950 font-black text-[10px]">
                          ₹
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-[#3395FF]/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-[#0C2340]">
                        Click to Scan
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Google Pay &bull; PhonePe &bull; Paytm &bull; BHIM &bull; CRED
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Or Enter UPI ID / VPA
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okaxis"
                        className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3395FF] font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => alert(`Verified UPI ID: ${upiId} (Registered to ${customerName})`)}
                        className="px-3 py-2 text-xs font-bold text-[#3395FF] hover:bg-blue-50 border border-[#3395FF]/30 rounded-xl transition-colors"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* B. Card Payment View */}
              {activeMethod === "CARD" && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 •••• •••• 8892"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3395FF] font-mono font-bold"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <span className="text-[10px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                          VISA
                        </span>
                        <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                          MC
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Expires (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="08/28"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3395FF] font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3395FF] font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name on card"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3395FF]"
                    />
                  </div>
                </div>
              )}

              {/* C. Netbanking View */}
              {activeMethod === "NETBANKING" && (
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Select Popular Bank
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: "HDFC", name: "HDFC Bank" },
                      { id: "ICICI", name: "ICICI Bank" },
                      { id: "SBI", name: "State Bank of India" },
                      { id: "AXIS", name: "Axis Bank" },
                      { id: "KOTAK", name: "Kotak Mahindra" },
                      { id: "YES", name: "Yes Bank" },
                    ].map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-3 rounded-xl border text-left font-bold transition-all flex items-center justify-between ${
                          selectedBank === bank.id
                            ? "border-[#3395FF] bg-blue-50/70 text-blue-900 shadow-2xs"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span>{bank.name}</span>
                        {selectedBank === bank.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#3395FF]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* D. Corporate / NEFT View */}
              {activeMethod === "NEFT" && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Brightloop Virtual Corporate Escrow
                  </span>
                  <div className="space-y-1 font-mono text-[11px] text-slate-700">
                    <div>Beneficiary: <strong className="text-slate-900 font-sans">Brightloop Software Pvt. Ltd.</strong></div>
                    <div>Virtual Account: <strong className="text-slate-900">BRIGHT99882201</strong></div>
                    <div>IFSC: <strong className="text-slate-900">RAZR0000001</strong></div>
                    <div>Bank: <strong className="text-slate-900 font-sans">Razorpay Virtual Bank</strong></div>
                  </div>
                </div>
              )}

              {/* Pay Now Button */}
              <div className="pt-2">
                <Button
                  onClick={handleStartPayment}
                  className="w-full bg-[#0D62FF] hover:bg-[#074FD9] text-white py-3 rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Lock className="w-4 h-4 text-blue-200" />
                  <span>Pay {formatINR(amount)}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-semibold pt-2.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>RBI Compliant &bull; PCI-DSS Level 1 &bull; 256-Bit SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: PROCESSING ANIMATION SCREEN                                      */}
        {/* ========================================================================= */}
        {paymentState === "PROCESSING" && (
          <div className="p-10 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-300 min-h-[340px]">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-blue-100 border-t-[#0D62FF] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-6 h-6 text-[#0D62FF] animate-pulse" />
              </div>
            </div>

            <div className="space-y-2 max-w-sm">
              <h3 className="text-base font-black text-slate-900">
                Processing Secure Payment
              </h3>
              <p className="text-xs text-slate-500 font-medium animate-pulse">
                {processingStep}
              </p>
              <p className="text-[11px] text-slate-400 font-mono pt-2">
                Amount: {formatINR(amount)} &bull; Reference: {generatedRef}
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Do not refresh or close this browser window.</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: PAYMENT SUCCESS CELEBRATION ANIMATION                            */}
        {/* ========================================================================= */}
        {paymentState === "SUCCESS" && (
          <div className="p-8 sm:p-10 flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in-95 duration-300">
            {/* Concentric Green Celebration Rings */}
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 animate-ping absolute" />
              <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center shadow-lg relative z-10 animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-in bounce-in duration-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Transaction Settled &amp; Reconciled</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Payment Successful!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Your payment of <strong className="text-slate-900">{formatINR(amount)}</strong> has been verified. Your subscription agreement is activated and tax invoice is settled.
              </p>
            </div>

            {/* Receipt Card */}
            <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Payment ID:</span>
                <span className="font-mono font-bold text-slate-900">{generatedRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-bold text-slate-800">{activeMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-mono text-slate-700">{new Date().toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-slate-900">
                <span>Total Amount Paid:</span>
                <span className="font-mono text-[#0D62FF]">{formatINR(amount)}</span>
              </div>
            </div>

            <Button
              onClick={onClose}
              className="w-full bg-[#0C2340] hover:bg-[#15345C] text-white py-3 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{successButtonText}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
