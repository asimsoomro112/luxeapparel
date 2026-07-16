'use client';

import { useState, useRef, useCallback } from 'react';
import { useAdminStore, AdminProduct } from '@/lib/adminStore';
import AdminTable from '@/components/admin/AdminTable';
import AdminModal from '@/components/admin/AdminModal';
import { Trash2, Edit2, Plus, UploadCloud, X, Star, Loader2, Image as ImageIcon } from 'lucide-react';

// ─── Cloudinary Upload Helper ────────────────────────────────────────────────
async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'luxe-products';

  // 1. Get signed params from our API route
  const signRes = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paramsToSign: { timestamp, folder } }),
  });
  const { signature, api_key } = await signRes.json();
  if (!signature) throw new Error('Failed to get Cloudinary signature');

  // 2. Upload the file
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', api_key);
  formData.append('timestamp', String(timestamp));
  formData.append('folder', folder);
  formData.append('signature', signature);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!uploadRes.ok) throw new Error('Cloudinary upload failed');
  const data = await uploadRes.json();
  return data.secure_url;
}

// ─── Image Preview Card ──────────────────────────────────────────────────────
interface PreviewImage {
  id: string;
  file?: File;
  url: string; // local blob or existing cloudinary URL
  cloudUrl?: string; // filled after upload
  uploading: boolean;
  error?: string;
  isThumbnail: boolean;
}

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useAdminStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState('T-Shirts');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState(30);
  const [status, setStatus] = useState<'active' | 'draft' | 'out_of_stock'>('active');
  const [sizesInput, setSizesInput] = useState('S, M, L, XL');
  const [featuresInput, setFeaturesInput] = useState('');
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName('');
    setPrice(3500);
    setCategory('T-Shirts');
    setDescription('Premium heavyweight cotton tee with signature drop-shoulder silhouette.');
    setStock(30);
    setStatus('active');
    setSizesInput('S, M, L, XL');
    setFeaturesInput('100% Combed ring-spun cotton (280 GSM)\nPre-shrunk & bio-washed\nSignature drop-shoulder silhouette');
    setImages([]);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (product: AdminProduct) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price);
    setCategory(product.category);
    setDescription(product.description || '');
    setStock(product.stock);
    setStatus(product.status);
    setSizesInput(product.sizes?.join(', ') || 'S, M, L, XL');
    setFeaturesInput(product.features?.join('\n') || '');

    // Pre-load existing images
    const existingImages: PreviewImage[] = [];
    const allImgs: string[] = [];
    if (product.image) allImgs.push(product.image);
    if ((product as any).images?.length) {
      (product as any).images.forEach((u: string) => { if (!allImgs.includes(u)) allImgs.push(u); });
    }
    allImgs.forEach((url, i) => {
      existingImages.push({ id: `existing-${i}`, url, cloudUrl: url, uploading: false, isThumbnail: i === 0 });
    });
    setImages(existingImages);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) deleteProduct(id);
  };

  // ─── Image Upload Logic ──────────────────────────────────────────
  const addFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!fileArr.length) return;

    const newPreviews: PreviewImage[] = fileArr.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      file,
      url: URL.createObjectURL(file),
      uploading: true,
      isThumbnail: false,
    }));

    setImages(prev => {
      const combined = [...prev, ...newPreviews];
      // First image gets thumbnail if no thumbnail set
      if (!combined.some(img => img.isThumbnail)) {
        combined[0].isThumbnail = true;
      }
      return combined;
    });

    // Upload each file in parallel
    for (const preview of newPreviews) {
      uploadToCloudinary(preview.file!)
        .then(cloudUrl => {
          setImages(prev => prev.map(img =>
            img.id === preview.id ? { ...img, cloudUrl, uploading: false } : img
          ));
        })
        .catch(err => {
          console.error('Upload failed:', err);
          setImages(prev => prev.map(img =>
            img.id === preview.id ? { ...img, uploading: false, error: 'Upload failed' } : img
          ));
        });
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // If we removed the thumbnail, assign thumbnail to first remaining
      if (!filtered.some(img => img.isThumbnail) && filtered.length > 0) {
        filtered[0].isThumbnail = true;
      }
      return filtered;
    });
  };

  const setThumbnail = (id: string) => {
    setImages(prev => prev.map(img => ({ ...img, isThumbnail: img.id === id })));
  };

  // ─── Submit ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const stillUploading = images.some(img => img.uploading);
    if (stillUploading) {
      alert('Please wait — images are still uploading…');
      return;
    }
    if (images.length === 0) {
      alert('Please add at least one product image.');
      return;
    }

    setIsSubmitting(true);

    const thumbnail = images.find(img => img.isThumbnail);
    const allUrls = images.map(img => img.cloudUrl || img.url);
    const thumbnailUrl = thumbnail?.cloudUrl || thumbnail?.url || allUrls[0];

    const sizes = sizesInput.split(',').map(s => s.trim()).filter(Boolean);
    const features = featuresInput.split('\n').map(f => f.trim()).filter(Boolean);

    const payload = {
      name,
      price: Number(price),
      image: thumbnailUrl,
      images: allUrls,
      category,
      description,
      stock: Number(stock),
      status,
      sizes,
      features,
    };

    try {
      if (editingProduct) {
        updateProduct(editingProduct.id, payload);
      } else {
        addProduct(payload);
      }
      setModalOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Table Columns ───────────────────────────────────────────────
  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (item: any) => (
        <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-gray-100 border border-[var(--color-border-glass)]">
          <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Silhouette / Name',
      sortable: true,
      render: (item: any) => (
        <div className="flex flex-col">
          <span className="font-semibold">{item.name}</span>
          <span className="text-[10px] text-[var(--color-ink-muted)] font-mono">{item.id}</span>
        </div>
      ),
    },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (item: any) => <span>Rs. {item.price.toLocaleString()}</span>,
    },
    {
      key: 'stock',
      label: 'Stock Level',
      sortable: true,
      render: (item: any) => (
        <div className="flex items-center gap-1.5 font-mono">
          <span className={`w-2 h-2 rounded-full ${item.stock < 15 ? 'bg-[var(--color-danger)] animate-pulse' : 'bg-[var(--color-success)]'}`} />
          <span className={item.stock < 15 ? 'text-[var(--color-danger)] font-bold' : ''}>{item.stock} pcs</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item: any) => {
        const styles: Record<string, string> = {
          active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          draft: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
          out_of_stock: 'bg-red-500/10 text-red-600 dark:text-red-400',
        };
        const labels: Record<string, string> = { active: 'Active', draft: 'Draft', out_of_stock: 'Out of Stock' };
        const s = item.status || 'draft';
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[s]}`}>{labels[s]}</span>;
      },
    },
  ];

  const inputCls = "px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-glass)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-[var(--color-ink)]";
  const labelCls = "text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]";

  return (
    <div className="flex flex-col gap-8">
      {/* Title / Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-ink)]">Products</h1>
          <p className="text-sm text-[var(--color-ink-muted)]">Configure silhouettes, inventory, pricing.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-full text-xs font-semibold bg-[var(--color-ink)] text-[var(--color-bg)] hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Table Card */}
      <div className="glass-2 rounded-3xl p-6">
        <AdminTable
          data={products}
          columns={columns}
          searchKeys={['name', 'category', 'id']}
          searchPlaceholder="Search product silhouettes..."
          actions={(item: AdminProduct) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => openEditModal(item)}
                className="p-2 hover:bg-[var(--color-ink)]/5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 hover:bg-[var(--color-danger)]/10 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-danger)] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      </div>

      {/* Add / Edit Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Silhouette' : 'Add Silhouette'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Name & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="LUXE Drop-Shoulder Tee - Pitch Black" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Price (Rs.)</label>
              <input type="number" required min={0} value={price} onChange={e => setPrice(Number(e.target.value))} className={inputCls} placeholder="3500" />
            </div>
          </div>

          {/* ─── Image Uploader ─────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Product Images</label>
            <p className="text-[11px] text-[var(--color-ink-muted)]">Upload multiple photos. Click the ⭐ star icon to set the main thumbnail shown in listings.</p>

            {/* Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                isDragging
                  ? 'border-[var(--color-ink)] bg-[var(--color-ink)]/5 scale-[1.01]'
                  : 'border-[var(--color-border-glass)] hover:border-[var(--color-ink)]/40 hover:bg-[var(--color-ink)]/2'
              }`}
            >
              <UploadCloud className={`w-8 h-8 transition-colors ${isDragging ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)]'}`} />
              <div className="text-center">
                <p className="text-sm font-semibold text-[var(--color-ink)]">Drag & drop images here</p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">or click to browse files — JPG, PNG, WEBP supported</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Image Previews Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-1">
                {images.map(img => (
                  <div
                    key={img.id}
                    className={`relative group rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                      img.isThumbnail
                        ? 'border-amber-400 shadow-lg shadow-amber-400/20'
                        : 'border-[var(--color-border-glass)]'
                    }`}
                  >
                    {/* Image */}
                    <img src={img.url} alt="" className="w-full h-full object-cover" />

                    {/* Uploading overlay */}
                    {img.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}

                    {/* Error overlay */}
                    {img.error && (
                      <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center p-2">
                        <p className="text-white text-[10px] text-center">{img.error}</p>
                      </div>
                    )}

                    {/* Thumbnail badge */}
                    {img.isThumbnail && (
                      <div className="absolute top-1 left-1 bg-amber-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" /> THUMB
                      </div>
                    )}

                    {/* Hover Actions */}
                    {!img.uploading && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!img.isThumbnail && (
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setThumbnail(img.id); }}
                            title="Set as thumbnail"
                            className="w-7 h-7 bg-amber-400 text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); removeImage(img.id); }}
                          title="Remove image"
                          className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add more button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-[var(--color-border-glass)] flex flex-col items-center justify-center gap-1 text-[var(--color-ink-muted)] hover:border-[var(--color-ink)]/40 hover:text-[var(--color-ink)] transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Add More</span>
                </button>
              </div>
            )}

            {images.some(img => img.uploading) && (
              <p className="text-xs text-[var(--color-ink-muted)] flex items-center gap-1.5 mt-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Uploading to Cloudinary…
              </p>
            )}
          </div>

          {/* Category, Stock, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
                <option value="T-Shirts">T-Shirts</option>
                <option value="Hoodies">Hoodies</option>
                <option value="Pants">Pants</option>
                <option value="New Drops">New Drops</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Stock Quantity</label>
              <input type="number" required min={0} value={stock} onChange={e => setStock(Number(e.target.value))} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as any)} className={inputCls}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Describe the silhouette and fabric…" />
          </div>

          {/* Sizes */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Available Sizes (comma-separated)</label>
            <input type="text" required value={sizesInput} onChange={e => setSizesInput(e.target.value)} className={inputCls} placeholder="S, M, L, XL" />
          </div>

          {/* Features */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Key Features (one per line)</label>
            <textarea value={featuresInput} onChange={e => setFeaturesInput(e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder={"100% Premium cotton (300 GSM)\nThick 1.2-inch rib collar\nBaggy comfort fit"} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-3 rounded-full text-xs font-semibold glass text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || images.some(img => img.uploading)}
              className="px-5 py-3 rounded-full text-xs font-semibold bg-[var(--color-ink)] text-[var(--color-bg)] hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : editingProduct ? 'Save Changes' : 'Create Silhouette'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
