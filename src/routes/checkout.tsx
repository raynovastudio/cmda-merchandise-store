import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CreditCard,
  Copy,
  Check,
  Upload,
  User,
  Truck,
  Calendar,
  Package,
  CheckCircle2,
  AlertCircle,
  FileText,
  Info,
  Globe,
} from "lucide-react";
import { useState, useRef } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AvailabilityBadge } from "@/components/site/AvailabilityBadge";
import { formatNaira, getProduct } from "@/data/products";
import { useCart, useCartSubtotal, type CartItem } from "@/stores/cart";
import {
  useOrders,
  type FulfillmentMethod,
  type PaymentProof,
} from "@/stores/orders";
import { nigerianStates } from "@/data/conferences";
import { useConferences } from "@/stores/conferences";
import { cn } from "@/lib/utils";
import { getProductImage, resolveProduct, getEffectivePrice, useResolvedProduct } from "@/stores/adminProducts";

function calculatePaystackFee(amount: number): number {
  if (amount <= 2500) return 0;
  return Math.min(amount * 0.015 + 100, 2000);
}

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — CMDA Nigeria Store" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

type Step = "customer" | "fulfillment" | "payment" | "review";

const STEPS: { key: Step; label: string; icon: typeof User }[] = [
  { key: "customer", label: "Details", icon: User },
  { key: "fulfillment", label: "Fulfillment", icon: Truck },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "review", label: "Review", icon: CheckCircle2 },
];

function compressImage(dataUrl: string, maxWidth = 800, quality = 0.6): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width <= maxWidth) {
        resolve(dataUrl);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = maxWidth;
      canvas.height = (img.height / img.width) * maxWidth;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function SummaryItem({ item }: { item: CartItem }) {
  const resolved = useResolvedProduct(item.productId);
  if (!resolved) return null;
  const { product: p, image } = resolved;
  const unitPrice = getEffectivePrice(item.productId, item.quantity);
  return (
    <li className="flex items-center gap-3 text-sm">
      <img src={image} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{p.name}</p>
        <p className="text-xs text-muted-foreground">
          {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`]
            .filter(Boolean)
            .join(" · ") || "One size"}{" "}
          × {item.quantity}
        </p>
      </div>
      <p className="font-semibold text-foreground">{formatNaira(unitPrice * item.quantity)}</p>
    </li>
  );
}

function DelegateToggle({
  useDelegate,
  setUseDelegate,
  delegateName,
  setDelegateName,
  delegatePhone,
  setDelegatePhone,
  delegateEmail,
  setDelegateEmail,
  delegateRelationship,
  setDelegateRelationship,
  delegateInstructions,
  setDelegateInstructions,
}: {
  useDelegate: boolean;
  setUseDelegate: React.Dispatch<React.SetStateAction<boolean>>;
  delegateName: string;
  setDelegateName: (v: string) => void;
  delegatePhone: string;
  setDelegatePhone: (v: string) => void;
  delegateEmail: string;
  setDelegateEmail: (v: string) => void;
  delegateRelationship: string;
  setDelegateRelationship: (v: string) => void;
  delegateInstructions: string;
  setDelegateInstructions: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-foreground">
            Someone else picking up for you?
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Assign a delegate to collect your order on your behalf.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setUseDelegate((v) => !v)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
            useDelegate ? "bg-primary" : "bg-gray-300",
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 rounded-full bg-white transition-transform",
              useDelegate ? "translate-x-6" : "translate-x-1",
            )}
          />
        </button>
      </div>

      {useDelegate && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-foreground">
                Delegate's Full Name *
              </label>
              <input
                value={delegateName}
                onChange={(e) => setDelegateName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                placeholder="Person's full name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">
                Phone Number *
              </label>
              <input
                value={delegatePhone}
                onChange={(e) => setDelegatePhone(e.target.value)}
                type="tel"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                placeholder="+234 800 000 0000"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">
                Email <span className="text-muted-foreground">(Optional)</span>
              </label>
              <input
                value={delegateEmail}
                onChange={(e) => setDelegateEmail(e.target.value)}
                type="email"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">
                Relationship *
              </label>
              <input
                value={delegateRelationship}
                onChange={(e) => setDelegateRelationship(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                placeholder="e.g. Colleague, Friend"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-foreground">
                Special Instructions
              </label>
              <textarea
                value={delegateInstructions}
                onChange={(e) => setDelegateInstructions(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                placeholder="Any instructions for the delegate..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const addOrder = useOrders((s) => s.addOrder);
  const conferences = useConferences((s) => s.conferences);

  const [step, setStep] = useState<Step>("customer");
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState<string>("");

  // Customer info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [membershipNumber, setMembershipNumber] = useState("");

  // Fulfillment
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<FulfillmentMethod>("wholeness-pickup");
  const [selectedConference, setSelectedConference] = useState("");
  const [useDelegate, setUseDelegate] = useState(false);
  const [delegateName, setDelegateName] = useState("");
  const [delegatePhone, setDelegatePhone] = useState("");
  const [delegateEmail, setDelegateEmail] = useState("");
  const [delegateRelationship, setDelegateRelationship] = useState("");
  const [delegateInstructions, setDelegateInstructions] = useState("");
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  // International delivery
  const [intlCountry, setIntlCountry] = useState("");
  const [intlCity, setIntlCity] = useState("");
  const [intlAddress, setIntlAddress] = useState("");
  const [intlPostalCode, setIntlPostalCode] = useState("");
  const [intlInstructions, setIntlInstructions] = useState("");

  // Payment proof
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "manual">("paystack");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");
  const [proofAmount, setProofAmount] = useState("");
  const [proofDate, setProofDate] = useState("");
  const [proofReference, setProofReference] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subtotal = useCartSubtotal();
  const deliveryFee = fulfillmentMethod === "delivery" ? 0 : 0;
  const grandTotal = subtotal + deliveryFee;
  const paystackFee = calculatePaystackFee(grandTotal);
  const paystackTotal = grandTotal + paystackFee;

  if (items.length === 0 && !submitted) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-primary-soft text-primary">
            <Package className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground">
            Your cart is empty
          </h1>
          <p className="mt-2 text-muted-foreground">
            Add some merchandise before checking out.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Browse merchandise
          </Link>
        </div>
      </SiteLayout>
    );
  }

  if (submitted) {
    const order = useOrders.getState().getOrder(orderId);
    return (
      <SiteLayout>
        <section className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-xl bg-brand-green-soft text-brand-green">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="mt-6 font-display text-4xl font-bold text-foreground">
            Thank you.
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Your merchandise order has been received and is awaiting payment
            verification.
          </p>
          {order && (
            <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6 text-left shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    Order Number
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold text-foreground">
                    {order.orderNumber}
                  </p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-semibold text-foreground">
                    Awaiting Payment Verification
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold text-foreground">
                    {formatNaira(order.grandTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fulfillment</span>
                  <span className="font-semibold text-foreground capitalize">
                    {order.fulfillmentMethod.replace(/-/g, " ")}
                  </span>
                </div>
              </div>
            </div>
          )}
          <p className="mt-6 text-sm text-muted-foreground">
            You'll receive updates as your order progresses.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              View Orders
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground"
            >
              Continue Shopping
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  const canProceedCustomer = fullName && email && phone;
  const canProceedFulfillment =
    fulfillmentMethod === "conference-pickup"
      ? !!selectedConference && (!useDelegate || (delegateName && delegatePhone && delegateRelationship))
      : fulfillmentMethod === "wholeness-pickup"
        ? !useDelegate || (delegateName && delegatePhone && delegateRelationship)
        : fulfillmentMethod === "international-delivery"
          ? deliveryName && deliveryPhone && intlCountry && intlCity && intlAddress
          : deliveryName && deliveryPhone && deliveryState && deliveryCity && deliveryAddress;
  const canProceedPayment = paymentMethod === "paystack" || (proofFile && proofAmount && proofDate);
  const canSubmit = canProceedCustomer && canProceedFulfillment && canProceedPayment;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) return;
    setProofFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const raw = ev.target?.result as string;
        const compressed = await compressImage(raw);
        setProofPreview(compressed);
      };
      reader.readAsDataURL(file);
    } else {
      setProofPreview("");
    }
  };

  const copyAccountNumber = () => {
    navigator.clipboard.writeText("6576866256");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitError("");
    setSubmitting(true);
    try {
      const order = await addOrder({
      customerName: fullName,
      customerEmail: email,
      customerPhone: phone,
      membershipNumber,
      items: items.map((item) => {
        const p = resolveProduct(item.productId)!;
        return {
          productId: item.productId,
          name: p.name,
          price: getEffectivePrice(item.productId, item.quantity),
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          image: getProductImage(p.id, p.image),
        };
      }),
      fulfillmentMethod,
      conferencePickup:
        fulfillmentMethod === "conference-pickup"
          ? {
              conferenceId: selectedConference,
              conferenceName:
                conferences.find((c) => c.id === selectedConference)?.name || "",
            }
          : undefined,
      delegatePickup:
        useDelegate && delegateName && delegatePhone && delegateRelationship
          ? {
              fullName: delegateName,
              phone: delegatePhone,
              email: delegateEmail,
              relationship: delegateRelationship,
              instructions: delegateInstructions,
            }
          : undefined,
      delivery:
        fulfillmentMethod === "delivery"
          ? {
              recipientName: deliveryName,
              phone: deliveryPhone,
              state: deliveryState,
              city: deliveryCity,
              address: deliveryAddress,
              instructions: deliveryInstructions,
            }
          : fulfillmentMethod === "international-delivery"
            ? {
                recipientName: deliveryName,
                phone: deliveryPhone,
                state: "",
                city: intlCity,
                address: intlAddress,
                instructions: intlInstructions,
                country: intlCountry,
                postalCode: intlPostalCode,
              }
            : undefined,
      paymentProof:
        paymentMethod === "manual" && proofFile
          ? {
              fileName: proofFile.name,
              fileDataUrl: proofPreview,
              amountPaid: Number(proofAmount),
              paymentDate: proofDate,
              paymentReference: proofReference,
            }
          : paymentMethod === "paystack"
            ? {
                fileName: "paystack-payment",
                fileDataUrl: "",
                amountPaid: paystackTotal,
                paymentDate: new Date().toISOString().slice(0, 10),
                paymentReference: "Paid via Paystack",
              }
            : undefined,
      subtotal,
      deliveryFee,
      grandTotal,
    });
    setOrderId(order.id);
    clear();
    setSubmitted(true);
    } catch (err: unknown) {
      console.error("Order submission failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to place order. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to cart
          </Link>
          <h1 className="mt-4 font-display text-4xl font-bold text-foreground sm:text-5xl">
            Checkout
          </h1>
        </div>
      </section>

      {/* Step indicator */}
      <div className="border-b border-border/60 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 overflow-x-auto py-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === stepIndex;
              const isCompleted = i < stepIndex;
              return (
                <button
                  key={s.key}
                  onClick={() => {
                    if (i < stepIndex) setStep(s.key);
                  }}
                  disabled={i > stepIndex}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : isCompleted
                        ? "border-brand-green text-brand-green cursor-pointer"
                        : "border-transparent text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            {/* Step 1: Customer Details */}
            {step === "customer" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Customer Information
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tell us who this order is for.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">
                      Full Name *
                    </label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">
                      Email Address *
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">
                      Phone Number *
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">
                      Membership Number{" "}
                      <span className="text-muted-foreground">(Optional)</span>
                    </label>
                    <input
                      value={membershipNumber}
                      onChange={(e) => setMembershipNumber(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="CMDA-MEM-0000"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setStep("fulfillment")}
                  disabled={!canProceedCustomer}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Continue to Fulfillment
                </button>
              </div>
            )}

            {/* Step 2: Fulfillment */}
            {step === "fulfillment" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    How should you receive your order?
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose your preferred fulfillment method.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {(
                    [
                      {
                        key: "conference-pickup" as const,
                        icon: Calendar,
                        title: "Conference Pickup",
                        desc: "Collect at a listed CMDA conference",
                      },
                      {
                        key: "wholeness-pickup" as const,
                        icon: Package,
                        title: "Pick up at Wholeness House",
                        desc: "Collect at our office in Gwagwalada",
                      },
                      {
                        key: "delivery" as const,
                        icon: Truck,
                        title: "Nationwide Delivery",
                        desc: "Delivered to your location",
                      },
                      {
                        key: "international-delivery" as const,
                        icon: Globe,
                        title: "International Delivery",
                        desc: "Shipped outside Nigeria",
                      },
                    ] as const
                  ).map(({ key, icon: Icon, title, desc }) => (
                    <button
                      key={key}
                      onClick={() => setFulfillmentMethod(key)}
                      className={cn(
                        "flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-all",
                        fulfillmentMethod === key
                          ? "border-primary bg-primary-soft shadow-card"
                          : "border-border bg-card hover:border-primary/40",
                      )}
                    >
                      <div
                        className={cn(
                          "grid h-10 w-10 place-items-center rounded-xl",
                          fulfillmentMethod === key
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-display text-lg font-bold text-foreground">
                          {title}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Conference pickup */}
                {fulfillmentMethod === "conference-pickup" && (
                  <div className="mt-4 space-y-3">
                    <label className="mb-1 block text-sm font-semibold text-foreground">
                      Select a Conference
                    </label>
                    {conferences
                      .filter((c) => c.pickupEnabled)
                      .map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedConference(c.id)}
                          className={cn(
                            "w-full rounded-xl border-2 p-4 text-left transition-all",
                            selectedConference === c.id
                              ? "border-primary bg-primary-soft"
                              : "border-border bg-card hover:border-primary/40",
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-foreground">
                                {c.name}
                              </p>
                              <p className="mt-0.5 text-sm text-muted-foreground">
                                {c.location}
                              </p>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <p>
                                {new Date(c.date).toLocaleDateString("en-NG", {
                                  month: "short",
                                  day: "numeric",
                                })}{" "}
                                –{" "}
                                {new Date(c.endDate).toLocaleDateString("en-NG", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}

                    {selectedConference && (
                      <DelegateToggle
                        useDelegate={useDelegate}
                        setUseDelegate={setUseDelegate}
                        delegateName={delegateName}
                        setDelegateName={setDelegateName}
                        delegatePhone={delegatePhone}
                        setDelegatePhone={setDelegatePhone}
                        delegateEmail={delegateEmail}
                        setDelegateEmail={setDelegateEmail}
                        delegateRelationship={delegateRelationship}
                        setDelegateRelationship={setDelegateRelationship}
                        delegateInstructions={delegateInstructions}
                        setDelegateInstructions={setDelegateInstructions}
                      />
                    )}
                  </div>
                )}

                {/* Wholeness House pickup */}
                {fulfillmentMethod === "wholeness-pickup" && (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-border/60 bg-card p-6">
                      <p className="font-display text-lg font-bold text-foreground">
                        Pickup at Wholeness House
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Your order will be available for collection at our national office.
                      </p>
                      <div className="mt-4 rounded-xl bg-secondary/60 p-4 space-y-1 text-sm">
                        <p className="font-semibold text-foreground">Wholeness House</p>
                        <p className="text-muted-foreground">Gwagwalada, FCT, Nigeria</p>
                      </div>
                    </div>

                    <DelegateToggle
                      useDelegate={useDelegate}
                      setUseDelegate={setUseDelegate}
                      delegateName={delegateName}
                      setDelegateName={setDelegateName}
                      delegatePhone={delegatePhone}
                      setDelegatePhone={setDelegatePhone}
                      delegateEmail={delegateEmail}
                      setDelegateEmail={setDelegateEmail}
                      delegateRelationship={delegateRelationship}
                      setDelegateRelationship={setDelegateRelationship}
                      delegateInstructions={delegateInstructions}
                      setDelegateInstructions={setDelegateInstructions}
                    />
                  </div>
                )}

                {/* Delivery */}
                {fulfillmentMethod === "delivery" && (
                  <div className="mt-4 space-y-4 rounded-2xl border border-border/60 bg-card p-6">
                    <p className="font-display text-lg font-bold text-foreground">
                      Delivery Information
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                          Recipient Name *
                        </label>
                        <input
                          value={deliveryName}
                          onChange={(e) => setDeliveryName(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="Recipient's full name"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                          Phone Number *
                        </label>
                        <input
                          value={deliveryPhone}
                          onChange={(e) => setDeliveryPhone(e.target.value)}
                          type="tel"
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="+234 800 000 0000"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                          State *
                        </label>
                        <select
                          value={deliveryState}
                          onChange={(e) => setDeliveryState(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
                        >
                          <option value="">Select state</option>
                          {nigerianStates.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                          City *
                        </label>
                        <input
                          value={deliveryCity}
                          onChange={(e) => setDeliveryCity(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="City"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                          Complete Delivery Address *
                        </label>
                        <textarea
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                          placeholder="Street address, landmark, etc."
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                          Delivery Instructions
                        </label>
                        <textarea
                          value={deliveryInstructions}
                          onChange={(e) =>
                            setDeliveryInstructions(e.target.value)
                          }
                          rows={2}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                          placeholder="Any special delivery instructions..."
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      Delivery fee will be calculated by the Secretariat or
                      based on predefined shipping zones and added to your total
                      before payment.
                    </div>
                  </div>
                )}

                {/* International delivery */}
                {fulfillmentMethod === "international-delivery" && (
                  <div className="mt-4 space-y-4 rounded-2xl border border-border/60 bg-card p-6">
                    <p className="font-display text-lg font-bold text-foreground">
                      International Delivery Information
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                          Full Name *
                        </label>
                        <input
                          value={deliveryName}
                          onChange={(e) => setDeliveryName(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="Recipient's full name"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                          Phone Number *
                        </label>
                        <input
                          value={deliveryPhone}
                          onChange={(e) => setDeliveryPhone(e.target.value)}
                          type="tel"
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                          Country *
                        </label>
                        <input
                          value={intlCountry}
                          onChange={(e) => setIntlCountry(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="e.g. United Kingdom, Ghana, USA"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                          City *
                        </label>
                        <input
                          value={intlCity}
                          onChange={(e) => setIntlCity(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                          Postal / ZIP Code
                        </label>
                        <input
                          value={intlPostalCode}
                          onChange={(e) => setIntlPostalCode(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="Postal code"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                          Complete Address *
                        </label>
                        <textarea
                          value={intlAddress}
                          onChange={(e) => setIntlAddress(e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                          placeholder="Street address, apartment, landmark..."
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                          Delivery Instructions
                        </label>
                        <textarea
                          value={intlInstructions}
                          onChange={(e) => setIntlInstructions(e.target.value)}
                          rows={2}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                          placeholder="Any special delivery instructions..."
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      International shipping fees will be calculated by the
                      Secretariat and communicated before payment.
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("customer")}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep("payment")}
                    disabled={!canProceedFulfillment}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === "payment" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Payment
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose how you'd like to pay for your order.
                  </p>
                </div>

                {/* Payment method selector */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => setPaymentMethod("paystack")}
                    className={cn(
                      "flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-all",
                      paymentMethod === "paystack"
                        ? "border-primary bg-primary-soft shadow-card"
                        : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <div
                      className={cn(
                        "grid h-10 w-10 place-items-center rounded-xl",
                        paymentMethod === "paystack"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold text-foreground">
                        Pay with Paystack
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Card, bank transfer, USSD — instant verification
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("manual")}
                    className={cn(
                      "flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-all",
                      paymentMethod === "manual"
                        ? "border-primary bg-primary-soft shadow-card"
                        : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <div
                      className={cn(
                        "grid h-10 w-10 place-items-center rounded-xl",
                        paymentMethod === "manual"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold text-foreground">
                        Manual Transfer
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Bank transfer + upload payment receipt
                      </p>
                    </div>
                  </button>
                </div>

                {/* Paystack option */}
                {paymentMethod === "paystack" && (
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
                      <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5">
                        <p className="text-sm font-medium text-primary-foreground/80">
                          Order subtotal
                        </p>
                        <p className="mt-1 font-display text-2xl font-bold text-primary-foreground">
                          {formatNaira(paystackTotal)}
                        </p>
                      </div>
                      <div className="p-6 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium text-foreground">{formatNaira(grandTotal)}</span>
                        </div>
                        {paystackFee > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              Paystack fee
                              <Info className="h-3.5 w-3.5" />
                            </span>
                            <span className="font-medium text-foreground">{formatNaira(paystackFee)}</span>
                          </div>
                        )}
                        {paystackFee === 0 && (
                          <p className="text-xs text-green-600 font-medium">No Paystack fee for orders under ₦2,500</p>
                        )}
                        <div className="border-t border-border/60 pt-3 flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">Total to pay</span>
                          <span className="font-display text-lg font-bold text-primary">{formatNaira(paystackTotal)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Fee: 1.5% + ₦100 (capped at ₦2,000, waived under ₦2,500)
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://paystack.shop/pay/cmda-merch"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground shadow-elegant transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <CreditCard className="h-4 w-4" />
                      Pay {formatNaira(paystackTotal)} with Paystack
                    </a>
                    <p className="text-center text-xs text-muted-foreground">
                      After payment, return here and click "Submit Order" to complete your order.
                    </p>
                  </div>
                )}

                {/* Manual transfer option */}
                {paymentMethod === "manual" && (
                  <>
                    {/* OPay Account Card */}
                    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
                      <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5">
                        <p className="text-sm font-medium text-primary-foreground/80">
                          Transfer to this account
                        </p>
                        <p className="mt-1 font-display text-2xl font-bold text-primary-foreground">
                          {formatNaira(grandTotal)}
                        </p>
                      </div>
                      <div className="space-y-4 p-6">
                        <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Account Name
                            </p>
                            <p className="font-semibold text-foreground">
                              Christian Medical and Dental Association of Nigeria
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Account Number
                            </p>
                            <p className="font-display text-xl font-bold tracking-wider text-foreground">
                              6576866256
                            </p>
                          </div>
                          <button
                            onClick={copyAccountNumber}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                          >
                            {copied ? (
                              <>
                                <Check className="h-3 w-3" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" /> Copy
                              </>
                            )}
                          </button>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Bank</p>
                            <p className="font-semibold text-foreground">OPay</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Proof Upload */}
                    <div className="rounded-2xl border border-border/60 bg-card p-6">
                      <p className="font-display text-lg font-bold text-foreground">
                        Upload Payment Proof
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Upload a screenshot or receipt of your transfer.
                      </p>

                      <div className="mt-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-6 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                        >
                          {proofFile ? (
                            <>
                              <Check className="h-5 w-5 text-brand-green" />
                              <span className="text-sm font-medium">
                                {proofFile.name}
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-5 w-5" />
                              <span className="text-sm">
                                Click to upload JPG, PNG, or PDF
                              </span>
                            </>
                          )}
                        </button>
                        {proofPreview && (
                          <div className="mt-3 overflow-hidden rounded-xl border border-border">
                            <img
                              src={proofPreview}
                              alt="Payment proof"
                              className="max-h-48 w-full object-contain"
                            />
                          </div>
                        )}
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-foreground">
                            Amount Paid *
                          </label>
                          <input
                            value={proofAmount}
                            onChange={(e) => setProofAmount(e.target.value)}
                            type="number"
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                            placeholder="Amount in Naira"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-foreground">
                            Payment Date *
                          </label>
                          <input
                            value={proofDate}
                            onChange={(e) => setProofDate(e.target.value)}
                            type="date"
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="mb-1.5 block text-sm font-semibold text-foreground">
                            Payment Reference{" "}
                            <span className="text-muted-foreground">(Optional)</span>
                          </label>
                          <input
                            value={proofReference}
                            onChange={(e) => setProofReference(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                            placeholder="Transaction reference or narration"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("fulfillment")}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep("review")}
                    disabled={!canProceedPayment}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === "review" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Review Your Order
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Verify everything before submitting.
                  </p>
                </div>

                {/* Customer info */}
                <div className="rounded-2xl border border-border/60 bg-card p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    Customer
                  </p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="font-semibold text-foreground">{fullName}</p>
                    <p className="text-muted-foreground">{email}</p>
                    <p className="text-muted-foreground">{phone}</p>
                    {membershipNumber && (
                      <p className="text-muted-foreground">
                        Membership: {membershipNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Fulfillment */}
                <div className="rounded-2xl border border-border/60 bg-card p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    Fulfillment
                  </p>
                  <div className="mt-2 text-sm">
                    <p className="font-medium capitalize text-foreground">
                      {fulfillmentMethod.replace(/-/g, " ")}
                    </p>
                    {fulfillmentMethod === "conference-pickup" && (
                      <p className="mt-1 text-muted-foreground">
                        {conferences.find((c) => c.id === selectedConference)?.name}
                      </p>
                    )}
                    {fulfillmentMethod === "wholeness-pickup" && (
                      <p className="mt-1 text-muted-foreground">
                        Wholeness House, Gwagwalada, FCT
                      </p>
                    )}
                    {useDelegate && delegateName && (
                      <div className="mt-2 rounded-xl bg-secondary/60 p-3 space-y-0.5 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">
                          Delegate: {delegateName}
                        </p>
                        <p>{delegatePhone}</p>
                        <p>{delegateRelationship}</p>
                        {delegateInstructions && (
                          <p className="italic">"{delegateInstructions}"</p>
                        )}
                      </div>
                    )}
                    {fulfillmentMethod === "delivery" && (
                      <div className="mt-1 space-y-0.5 text-muted-foreground">
                        <p>{deliveryName}</p>
                        <p>
                          {deliveryAddress}, {deliveryCity}, {deliveryState}
                        </p>
                      </div>
                    )}
                    {fulfillmentMethod === "international-delivery" && (
                      <div className="mt-1 space-y-0.5 text-muted-foreground">
                        <p>{deliveryName}</p>
                        <p>{intlAddress}</p>
                        <p>{intlCity}{intlPostalCode ? `, ${intlPostalCode}` : ""}, {intlCountry}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment proof */}
                <div className="rounded-2xl border border-border/60 bg-card p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    Payment
                  </p>
                  <div className="mt-2 space-y-1 text-sm">
                    {paymentMethod === "paystack" ? (
                      <>
                        <p className="font-medium text-foreground">Paystack</p>
                        <p className="text-muted-foreground">Amount: {formatNaira(paystackTotal)}</p>
                        {paystackFee > 0 && (
                          <p className="text-muted-foreground">(includes {formatNaira(paystackFee)} Paystack fee)</p>
                        )}
                        <p className="text-muted-foreground">Date: {new Date().toISOString().slice(0, 10)}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-muted-foreground">{proofFile?.name}</p>
                        <p className="text-muted-foreground">
                          Amount: {formatNaira(Number(proofAmount))}
                        </p>
                        <p className="text-muted-foreground">Date: {proofDate}</p>
                        {proofReference && (
                          <p className="text-muted-foreground">
                            Reference: {proofReference}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("payment")}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-8 py-3.5 text-sm font-semibold text-white shadow-elegant transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Check className="h-4 w-4" /> {submitting ? "Placing Order..." : "Submit Order"}
                  </button>
                </div>
                {submitError && (
                  <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {submitError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <aside className="h-fit rounded-3xl border border-border/60 bg-card p-6 shadow-card">
            <p className="font-display text-xl font-bold text-foreground">Order Summary</p>
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <SummaryItem key={item.key} item={item} />
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold text-foreground">
                  {formatNaira(subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery fee</dt>
                <dd className="text-muted-foreground">
                  {fulfillmentMethod === "delivery"
                    ? "Calculated later"
                    : "Free"}
                </dd>
              </div>
              {paymentMethod === "paystack" && paystackFee > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground flex items-center gap-1">Paystack fee <Info className="h-3 w-3" /></dt>
                  <dd className="text-muted-foreground">{formatNaira(paystackFee)}</dd>
                </div>
              )}
              <div className="my-2 h-px bg-border" />
              <div className="flex justify-between">
                <dt className="font-display text-lg font-bold text-foreground">
                  {paymentMethod === "paystack" ? "Total to pay" : "Total"}
                </dt>
                <dd className="font-display text-lg font-bold text-foreground">
                  {formatNaira(paymentMethod === "paystack" ? paystackTotal : grandTotal)}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
