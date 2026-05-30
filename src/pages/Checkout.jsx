import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import emailjs from "@emailjs/browser";

// ── EmailJS credentials ──────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID         = "service_y6rn8fi";
const EMAILJS_TEMPLATE_ID        = "template_ctogvkl";
const EMAILJS_PUBLIC_KEY         = "D3dhA8Nhk0kq31t3J";
const EMAILJS_CLIENT_TEMPLATE_ID = "template_zjn0zte";
// ────────────────────────────────────────────────────────────────────────────

const HANDLING_RATE = 0.03;

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

function InputField({ label, id, required, error, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function Checkout() {
  const { cartItems, cartTotal, setCartItems } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handling = cartTotal > 0 ? parseFloat((cartTotal * HANDLING_RATE).toFixed(2)) : 0;
  const estimatedTotal = cartTotal + handling;

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-xl font-bold text-gray-700 mb-3">Your cart is empty</h2>
          <button onClick={() => navigate("/")} className="mt-2 px-6 py-2.5 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors">
            Continue Shopping
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim())  errs.lastName  = "Last name is required";
    if (!form.email.trim())     errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.phone.trim())     errs.phone = "Phone number is required";
    if (!form.address.trim())   errs.address = "Address is required";
    if (!form.city.trim())      errs.city = "City is required";
    if (!form.state)            errs.state = "State is required";
    if (!form.zip.trim())       errs.zip = "ZIP code is required";
    else if (!/^\d{5}(-\d{4})?$/.test(form.zip)) errs.zip = "Enter a valid ZIP (e.g. 12345)";
    return errs;
  };

  const buildItemsTable = () =>
    cartItems
      .map((i) => `• ${i.name} | Qty: ${i.qty} | Size: ${i.size || "N/A"} | Color: ${i.color || "N/A"} | $${(i.price * i.qty).toFixed(2)}`)
      .join("\n");

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
    const shippingAddress = `${form.address}, ${form.city}, ${form.state} ${form.zip}`;

    const templateParams = {
      order_number:     orderNumber,
      customer_name:    `${form.firstName} ${form.lastName}`,
      customer_email:   form.email,
      customer_phone:   form.phone,
      shipping_address: shippingAddress,
      order_items:      buildItemsTable(),
      subtotal:         `$${cartTotal.toFixed(2)}`,
      handling:         `$${handling.toFixed(2)}`,
      estimated_total:  `$${estimatedTotal.toFixed(2)}`,
      notes:            form.notes || "None",
    };

    try {
      // ── 1. Admin email ──
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      // ── 2. Client confirmation email ──
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_CLIENT_TEMPLATE_ID,
        { ...templateParams, to_email: form.email },
        EMAILJS_PUBLIC_KEY
      );

      // ── 3. Firestore mein order save karo ──
      await addDoc(collection(db, "orders"), {
        orderNumber,
        userId:          user.uid,
        customerName:    `${form.firstName} ${form.lastName}`,
        email:           form.email,
        phone:           form.phone,
        shippingAddress,
        items: cartItems.map((i) => ({
          productId: i._id ?? null,
          name:      i.name,
          image:     i.image ?? null,
          price:     i.price,
          qty:       i.qty,
          size:      i.size  || null,
          color:     i.color || null,
        })),
        subtotal:       cartTotal,
        handling,
        estimatedTotal,
        notes:          form.notes || "",
        status:         "pending",
        createdAt:      serverTimestamp(),
      });

      // ── 4. Cart clear karo aur Thank You page pe jao ──
      setCartItems([]);
      navigate("/thank-you", {
        state: {
          orderNumber,
          customerName: `${form.firstName} ${form.lastName}`,
          email: form.email,
          estimatedTotal,
          cartItems,
        },
      });

    } catch (err) {
      console.error("Order error:", err);
      alert("Something went wrong sending your order. Please try again or contact support.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full border ${errors[field] ? "border-red-400" : "border-gray-300"} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${errors[field] ? "focus:ring-red-300" : "focus:ring-gray-900"} transition`;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 md:px-10 lg:px-16 py-10 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* ── LEFT: Form ── */}
          <div className="flex-1 w-full space-y-8">

            {/* Contact */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="First Name" id="firstName" required error={errors.firstName}>
                  <input id="firstName" value={form.firstName} onChange={set("firstName")} className={inputClass("firstName")} placeholder="John" />
                </InputField>
                <InputField label="Last Name" id="lastName" required error={errors.lastName}>
                  <input id="lastName" value={form.lastName} onChange={set("lastName")} className={inputClass("lastName")} placeholder="Doe" />
                </InputField>
                <InputField label="Email Address" id="email" required error={errors.email}>
                  <input id="email" type="email" value={form.email} onChange={set("email")} className={inputClass("email")} placeholder="john@example.com" />
                </InputField>
                <InputField label="Phone Number" id="phone" required error={errors.phone}>
                  <input id="phone" type="tel" value={form.phone} onChange={set("phone")} className={inputClass("phone")} placeholder="(555) 000-0000" />
                </InputField>
              </div>
            </section>

            {/* Shipping */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <InputField label="Street Address" id="address" required error={errors.address}>
                  <input id="address" value={form.address} onChange={set("address")} className={inputClass("address")} placeholder="123 Main St, Apt 4B" />
                </InputField>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputField label="City" id="city" required error={errors.city}>
                    <input id="city" value={form.city} onChange={set("city")} className={inputClass("city")} placeholder="New York" />
                  </InputField>
                  <InputField label="State" id="state" required error={errors.state}>
                    <select id="state" value={form.state} onChange={set("state")} className={inputClass("state")}>
                      <option value="">Select</option>
                      {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </InputField>
                  <InputField label="ZIP Code" id="zip" required error={errors.zip}>
                    <input id="zip" value={form.zip} onChange={set("zip")} className={inputClass("zip")} placeholder="10001" maxLength={10} />
                  </InputField>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Order Notes <span className="text-gray-400 font-normal text-sm">(Optional)</span>
              </h2>
              <textarea
                value={form.notes}
                onChange={set("notes")}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition resize-none"
                placeholder="Special instructions, customization requests, etc."
              />
            </section>
          </div>

          {/* ── RIGHT: Summary ── */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="border border-gray-200 rounded-xl p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                Order Summary{" "}
                <span className="text-gray-500 font-normal text-sm">
                  ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})
                </span>
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.cartId} className="flex gap-3 items-start">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-contain bg-gray-50 border border-gray-200 rounded-lg p-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 leading-tight uppercase">{item.name}</p>
                      {item.size  && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                      {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                      <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                    </div>
                    <p className="text-xs font-bold text-gray-900 flex-shrink-0">${(item.price * item.qty).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2.5 text-sm border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Handling</span>
                  <span className="font-medium">${handling.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Shipping</span>
                  <span className="text-gray-400">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Sales Tax</span>
                  <span className="text-gray-400">--</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base">
                  <span>Estimated Total</span>
                  <span>${estimatedTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-6 w-full bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Placing Order...
                  </>
                ) : "Place Order"}
              </button>

              <button
                onClick={() => navigate("/cart")}
                className="mt-3 w-full border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-3 rounded-lg text-sm transition-colors"
              >
                ← Back to Cart
              </button>

              <p className="mt-4 text-xs text-gray-400 text-center leading-relaxed">
                By placing your order, you agree to our Terms and Conditions.
                Reach out to{" "}
                <a href="mailto:customercare@tcateamstore.com" className="underline hover:text-black">
                  customercare@tcateamstore.com
                </a>{" "}
                for questions.
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}