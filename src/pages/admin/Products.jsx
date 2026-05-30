import { useState, useEffect } from "react";
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, orderBy, query
} from "firebase/firestore";
import { db } from "../../firebase/config";

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const EMPTY_FORM = {
  name: "", brand: "", type: "", category: "",
  price: "", description: "", bestseller: false,
  sizes: [],
  variants: [{ color: "", images: [] }],
};

export default function Products() {
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editId, setEditId]             = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(null);
  const [uploadingIdx, setUploadingIdx] = useState(null);

  // ── Fetch products ────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // ── Form helpers ──────────────────────────────────────────────────────────
  const setField = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const setVariantField = (idx, field) => (e) =>
    setForm((p) => {
      const variants = [...p.variants];
      variants[idx] = { ...variants[idx], [field]: e.target.value };
      return { ...p, variants };
    });

  const addVariant = () =>
    setForm((p) => ({ ...p, variants: [...p.variants, { color: "", images: [] }] }));

  const removeVariant = (idx) =>
    setForm((p) => ({ ...p, variants: p.variants.filter((_, i) => i !== idx) }));

  const removeImage = (variantIdx, imgIdx) =>
    setForm((p) => {
      const variants = [...p.variants];
      variants[variantIdx] = {
        ...variants[variantIdx],
        images: variants[variantIdx].images.filter((_, i) => i !== imgIdx),
      };
      return { ...p, variants };
    });

  // ── Cloudinary upload ─────────────────────────────────────────────────────
  const uploadImages = async (files, variantIdx) => {
    setUploadingIdx(variantIdx);
    try {
      const urls = await Promise.all(
        Array.from(files).map(async (file) => {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", UPLOAD_PRESET);
          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            { method: "POST", body: data }
          );
          const json = await res.json();
          return json.secure_url;
        })
      );
      setForm((p) => {
        const variants = [...p.variants];
        variants[variantIdx] = {
          ...variants[variantIdx],
          images: [...(variants[variantIdx].images || []), ...urls],
        };
        return { ...p, variants };
      });
    } catch (err) {
      console.error("Upload error:", err);
      alert("Image upload failed");
    } finally {
      setUploadingIdx(null);
    }
  };

  // ── Open edit ─────────────────────────────────────────────────────────────
  const openEdit = (product) => {
    setEditId(product.id);
    setForm({
      name:        product.name        ?? "",
      brand:       product.brand       ?? "",
      type:        product.type        ?? "",
      category:    product.category    ?? "",
      price:       product.price       ?? "",
      description: product.description ?? "",
      bestseller:  product.bestseller  ?? false,
      sizes:       product.sizes       ?? [],
      variants:    product.variants?.length
        ? product.variants
        : [{ color: "", images: [] }],
    });
    setShowForm(true);
  };

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      alert("Name and price are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name:        form.name.trim(),
        brand:       form.brand.trim().toLowerCase(),
        type:        form.type.trim().toLowerCase(),
        category:    form.category,
        price:       parseFloat(form.price),
        description: form.description.trim(),
        bestseller:  form.bestseller,
        sizes:       form.sizes,
        variants:    form.variants,
      };

      if (editId) {
        await updateDoc(doc(db, "products", editId), payload);
      } else {
        await addDoc(collection(db, "products"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      await fetchProducts();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition";

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Product
        </button>
      </div>

      {/* Products list */}
      {loading ? (
        <div className="flex justify-center py-24">
          <svg className="animate-spin w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <p className="text-gray-400 text-sm mb-3">No products yet</p>
          <button onClick={openAdd} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg">
            Add First Product
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">

                {/* Image */}
                <div className="w-14 h-14 flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  {p.variants?.[0]?.images?.[0] ? (
                    <img src={p.variants[0].images[0]} alt={p.name} className="w-full h-full object-contain p-1"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{p.brand} · {p.type}</p>
                  {/* Sizes preview */}
                  {p.sizes?.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Sizes: {p.sizes.join(", ")}
                    </p>
                  )}
                </div>

                {/* Price */}
                <p className="text-sm font-bold text-gray-900 flex-shrink-0">${p.price}</p>

                {/* Bestseller badge */}
                {p.bestseller && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                    Bestseller
                  </span>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(p)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                      <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowForm(false)} />
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">
                  {editId ? "Edit Product" : "Add New Product"}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Modal body */}
              <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">

                {/* Basic info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Product Name *</label>
                    <input value={form.name} onChange={setField("name")} className={`mt-1 ${inputCls}`} placeholder="Fresh Foam X 860v14" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Price *</label>
                    <input type="number" value={form.price} onChange={setField("price")} className={`mt-1 ${inputCls}`} placeholder="139.99" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Brand</label>
                    <input value={form.brand} onChange={setField("brand")} className={`mt-1 ${inputCls}`} placeholder="new balance" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Type</label>
                    <input value={form.type} onChange={setField("type")} className={`mt-1 ${inputCls}`} placeholder="footwear / apparel / eyewear" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Category</label>
                    <select value={form.category} onChange={setField("category")} className={`mt-1 ${inputCls}`}>
                      <option value="">Select</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Kids">Kids</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <input
                      type="checkbox"
                      id="bestseller"
                      checked={form.bestseller}
                      onChange={(e) => setForm((p) => ({ ...p, bestseller: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="bestseller" className="text-sm font-semibold text-gray-700">
                      Mark as Bestseller
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-semibold text-gray-700">Description</label>
                  <textarea
                    value={form.description}
                    onChange={setField("description")}
                    rows={3}
                    className={`mt-1 ${inputCls} resize-none`}
                    placeholder="Product description..."
                  />
                </div>

                {/* ── Sizes ── */}
               {/* ── Sizes ── */}
<div>
  <label className="text-sm font-semibold text-gray-700">Sizes</label>
  <p className="text-xs text-gray-400 mb-2">
    Comma separated — e.g. <span className="font-medium">XS, S, M, L, XL</span> or <span className="font-medium">7, 8, 9, 10, 11</span>
  </p>
  <input
    value={form.sizesRaw ?? form.sizes.join(", ")}
    onChange={(e) => {
      const raw = e.target.value;
      setForm((p) => ({
        ...p,
        sizesRaw: raw,
        sizes: raw.split(",").map((s) => s.trim()).filter(Boolean),
      }));
    }}
    className={inputCls}
    placeholder="XS, S, M, L, XL, XXL"
  />
  {/* Sizes preview */}
  {form.sizes.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-2">
      {form.sizes.map((s) => (
        <span key={s} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
          {s}
        </span>
      ))}
    </div>
  )}
</div>

                {/* ── Variants ── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">Variants (Color + Images)</label>
                    <button
                      onClick={addVariant}
                      className="text-xs font-semibold text-gray-600 border border-gray-300 px-2.5 py-1 rounded-lg hover:bg-gray-50"
                    >
                      + Add Variant
                    </button>
                  </div>

                  <div className="space-y-4">
                    {form.variants.map((variant, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="text-xs font-semibold text-gray-600">Color</label>
                            <input
                              value={variant.color}
                              onChange={setVariantField(idx, "color")}
                              className={`mt-1 ${inputCls}`}
                              placeholder="black, white, navy..."
                            />
                          </div>
                          {form.variants.length > 1 && (
                            <button
                              onClick={() => removeVariant(idx)}
                              className="mt-5 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Images */}
                        <div>
                          <label className="text-xs font-semibold text-gray-600">Images</label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {variant.images?.map((url, imgIdx) => (
                              <div key={imgIdx} className="relative group">
                                <img
                                  src={url}
                                  alt=""
                                  className="w-16 h-16 object-contain border border-gray-200 rounded-lg bg-gray-50 p-0.5"
                                />
                                <button
                                  onClick={() => removeImage(idx, imgIdx)}
                                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >✕</button>
                              </div>
                            ))}

                            {/* Upload button */}
                            <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                              {uploadingIdx === idx ? (
                                <svg className="animate-spin w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
                              ) : (
                                <>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-400">
                                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                  </svg>
                                  <span className="text-[10px] text-gray-400 mt-0.5">Upload</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => uploadImages(e.target.files, idx)}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-black disabled:bg-gray-400 transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Saving...
                    </>
                  ) : editId ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}