import { BedsheetProduct, BEDSHEETS_CATALOG } from '../data/products';
import { Order, INITIAL_ORDERS } from '../data/orders';
import { SiteContent, INITIAL_SITE_CONTENT } from '../data/siteContent';
import { compressImage } from '../utils/imageCompressor';
import {
  savePersistentProducts,
  getPersistentProducts,
  getPersistentProductsTimestamp,
  savePersistentContent,
  getPersistentContent,
  savePersistentOrders,
  getPersistentOrders,
  getAllPersistentImages,
  savePersistentImage
} from '../utils/persistentStorage';
import { resolveBedsheetImage } from '../utils/imageUrl';
import {
  saveImageToFirestore,
  getAllImagesFromFirestore,
  getProductsFromFirestore,
  saveAllProductsToFirestore,
  saveProductToFirestore,
  deleteProductFromFirestore,
  getOrdersFromFirestore,
  saveOrderToFirestore,
  getSiteContentFromFirestore,
  saveSiteContentToFirestore
} from '../firebase';

// Upload Image API: Compresses image and persists directly to Firestore and IndexedDB
export async function uploadImageApi(imageInput: string | File, productId?: string): Promise<string> {
  try {
    // If it's already an existing data URL or remote URL, use as is
    if (typeof imageInput === 'string' && (imageInput.startsWith('data:image/') || imageInput.startsWith('http://') || imageInput.startsWith('https://'))) {
      if (productId) {
        saveImageToFirestore(productId, imageInput);
      }
      return imageInput;
    }

    // 1. Compress image client-side to lightweight JPEG (~70KB-120KB)
    // Storing the self-contained data URL ensures photos NEVER 404 when server containers restart!
    const compressed = await compressImage(imageInput, 1280, 1280, 0.82);

    // 2. Also send to server for disk copy
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: compressed }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.url) {
          if (productId) {
            saveImageToFirestore(productId, data.url);
            savePersistentImage(productId, data.url).catch(() => {});
          }
          return data.url;
        }
      }
    } catch {}

    // 3. Fallback: store permanently in Google Cloud Firestore & IndexedDB
    if (productId && compressed) {
      saveImageToFirestore(productId, compressed);
      savePersistentImage(productId, compressed).catch(() => {});
    }

    return compressed;
  } catch (err) {
    console.warn('Upload API failed, falling back:', err);
    if (typeof imageInput === 'string') return imageInput;
    return await compressImage(imageInput, 1280, 1280, 0.82);
  }
}

// Products API: Loads directly from Google Cloud Firestore (permanent cloud database)
export async function getProducts(): Promise<BedsheetProduct[]> {
  // 1. Gather all persistent custom photos (Firestore Cloud + Local IndexedDB)
  let persistentImages: Record<string, string> = {};
  try {
    const [localImgs, cloudImgs] = await Promise.all([
      getAllPersistentImages().catch(() => ({})),
      getAllImagesFromFirestore().catch(() => ({})),
    ]);
    persistentImages = { ...localImgs, ...cloudImgs };
  } catch {}

  // 2. Read local cache from BOTH localStorage AND IndexedDB
  const localSaved = localStorage.getItem('cotton_nest_products');
  let localTimestamp = Number(localStorage.getItem('cotton_nest_products_updated_at') || 0);
  let localProducts: BedsheetProduct[] | null = null;
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localProducts = parsed;
      }
    } catch {}
  }

  // Also read from permanent IndexedDB
  let idbProducts: BedsheetProduct[] | null = null;
  let idbTimestamp = 0;
  try {
    const [idbData, idbTs] = await Promise.all([
      getPersistentProducts(),
      getPersistentProductsTimestamp(),
    ]);
    if (Array.isArray(idbData) && idbData.length > 0) {
      idbProducts = idbData;
      idbTimestamp = idbTs || 0;
    }
  } catch {}

  // Select the freshest local dataset
  if (idbProducts && (!localProducts || idbTimestamp >= localTimestamp)) {
    localProducts = idbProducts;
    localTimestamp = Math.max(localTimestamp, idbTimestamp);
  }

  // 3. Primary Source: Google Cloud Firestore (Permanent cloud database that never resets)
  try {
    const cloudProducts = await getProductsFromFirestore();
    if (cloudProducts && cloudProducts.length > 0) {
      const cloudTimestamp = Math.max(...cloudProducts.map((p: any) => p.updatedAt || 0), 0);

      // If local edits were made more recently, keep local and sync to cloud
      if (localProducts && localProducts.length > 0 && localTimestamp > cloudTimestamp + 2000) {
        saveAllProductsToFirestore(localProducts).catch(() => {});
        fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localProducts),
        }).catch(() => {});

        return localProducts.map((p) => {
          const rawImg = persistentImages[p.id] || p.image;
          return { ...p, image: resolveBedsheetImage(rawImg, p.id) };
        });
      }

      // Cloud Firestore is authoritative
      const orderMap = new Map(BEDSHEETS_CATALOG.map((p, idx) => [p.id, idx]));
      cloudProducts.sort((a, b) => {
        const orderA = typeof (a as any).order === 'number' ? (a as any).order : (orderMap.get(a.id) ?? 999);
        const orderB = typeof (b as any).order === 'number' ? (b as any).order : (orderMap.get(b.id) ?? 999);
        return orderA - orderB;
      });

      const merged = cloudProducts.map((p) => {
        const rawImg = persistentImages[p.id] || p.image;
        return { ...p, image: resolveBedsheetImage(rawImg, p.id) };
      });

      // Cache locally
      try {
        const lightweight = merged.map((p) => (p.image?.startsWith('data:') ? { ...p, image: `/photo/${p.id}.jpg` } : p));
        localStorage.setItem('cotton_nest_products', JSON.stringify(lightweight));
        localStorage.setItem('cotton_nest_products_updated_at', String(cloudTimestamp || Date.now()));
      } catch {}
      savePersistentProducts(merged, cloudTimestamp || Date.now()).catch(() => {});

      // Keep backend server disk in sync as secondary replica
      fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      }).catch(() => {});

      return merged;
    }
  } catch (err) {
    console.warn('Firestore fetch failed, checking local & server backups:', err);
  }

  // 4. Secondary: Local Storage / IndexedDB (Instant client cache)
  if (localProducts && localProducts.length > 0) {
    const merged = localProducts.map((p) => {
      const rawImg = persistentImages[p.id] || p.image;
      return { ...p, image: resolveBedsheetImage(rawImg, p.id) };
    });
    return merged;
  }

  // 5. Tertiary: Backend Server API disk cache
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const serverData = await res.json();
      if (Array.isArray(serverData) && serverData.length > 0) {
        const merged = serverData.map((p: BedsheetProduct) => {
          const rawImg = persistentImages[p.id] || p.image;
          return { ...p, image: resolveBedsheetImage(rawImg, p.id) };
        });
        return merged;
      }
    }
  } catch (err) {
    console.warn('Backend fetch failed, falling back to base catalog:', err);
  }

  // 6. Absolute initial fallback: BEDSHEETS_CATALOG with base timestamp (never synthetic Date.now())
  return BEDSHEETS_CATALOG.map((p, idx) => {
    const rawImg = persistentImages[p.id] || p.image;
    return { ...p, order: idx, image: resolveBedsheetImage(rawImg, p.id), updatedAt: 1 };
  });
}

export async function saveAllProducts(products: BedsheetProduct[]): Promise<void> {
  const saveTimestamp = Date.now();
  // Ensure each product carries its permanent order position and fresh save timestamp
  const orderedProducts = products.map((p, idx) => ({
    ...p,
    order: typeof p.order === 'number' ? p.order : idx,
    updatedAt: saveTimestamp,
  }));

  // Clean lightweight version for localStorage (prevents quota exceeded error)
  const lightweightProducts = orderedProducts.map((p) => {
    let cleanImage = p.image;
    if (cleanImage && cleanImage.startsWith('data:image/')) {
      cleanImage = `/photo/${p.id}.jpg`;
    }
    const cleanVariants = p.variants?.map((v) => {
      if (v.image && v.image.startsWith('data:image/')) {
        return { ...v, image: `/photo/${v.id || p.id}.jpg` };
      }
      return v;
    });
    return {
      ...p,
      image: cleanImage,
      variants: cleanVariants,
    };
  });

  // 1. Synchronous localStorage save with lightweight payload (never exceeds 20KB quota)
  try {
    localStorage.setItem('cotton_nest_products', JSON.stringify(lightweightProducts));
    localStorage.setItem('cotton_nest_products_updated_at', String(saveTimestamp));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }

  // 2. Parallel saves to IndexedDB (permanent client DB) and Backend Server (authoritative disk DB),
  // with non-blocking Firestore cloud sync
  await Promise.allSettled([
    savePersistentProducts(orderedProducts, saveTimestamp),
    fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderedProducts),
    }).catch((err) => console.warn('Server sync warning:', err)),
    saveAllProductsToFirestore(orderedProducts).catch((err) => console.warn('Firestore sync warning:', err)),
  ]);
}

export async function addProduct(product: BedsheetProduct): Promise<BedsheetProduct> {
  saveProductToFirestore(product);
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to post product to server:', err);
  }
  return product;
}

export async function updateSingleProduct(id: string, product: Partial<BedsheetProduct>): Promise<void> {
  // Save to Firestore
  try {
    const cached = JSON.parse(localStorage.getItem('cotton_nest_products') || '[]');
    const existing = cached.find((p: BedsheetProduct) => p.id === id);
    if (existing) {
      saveProductToFirestore({ ...existing, ...product });
    }
  } catch {}

  try {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
  } catch (err) {
    console.error('Failed to update product on server:', err);
  }
}

export async function removeProduct(id: string): Promise<void> {
  // Delete from Cloud Firestore permanently
  await deleteProductFromFirestore(id);

  // Delete from backend server
  try {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.error('Failed to delete product on server:', err);
  }
}

// Orders API
export async function getOrders(): Promise<Order[]> {
  // 1. Try Cloud Firestore
  try {
    const cloudOrders = await getOrdersFromFirestore();
    if (cloudOrders && cloudOrders.length > 0) {
      return cloudOrders;
    }
  } catch {}

  // 2. Try Backend Server
  try {
    const res = await fetch('/api/orders');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        localStorage.setItem('cotton_nest_orders', JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend orders fetch failed, falling back to local storage:', err);
  }

  // 3. Fallback to localStorage
  try {
    const cached = localStorage.getItem('cotton_nest_orders');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  return INITIAL_ORDERS;
}

export async function saveOrder(order: Order): Promise<void> {
  // 1. Save to Cloud Firestore
  saveOrderToFirestore(order);

  // 2. Optimistic local cache
  try {
    const cached = JSON.parse(localStorage.getItem('cotton_nest_orders') || '[]');
    localStorage.setItem('cotton_nest_orders', JSON.stringify([order, ...cached]));
  } catch {}

  // 3. Backend server
  try {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
  } catch (err) {
    console.error('Failed to post order to server:', err);
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  try {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    console.error('Failed to update order status on server:', err);
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  try {
    await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
  } catch (err) {
    console.error('Failed to delete order on server:', err);
  }
}

// Site Content API
export async function getSiteContent(): Promise<SiteContent> {
  const localSaved = localStorage.getItem('cotton_nest_site_content');
  let localTimestamp = Number(localStorage.getItem('cotton_nest_site_content_updated_at') || 0);
  let localContent: SiteContent | null = null;
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      if (parsed && parsed.company) {
        localContent = parsed;
      }
    } catch {}
  }

  // Also check IndexedDB
  try {
    const idbContent = await getPersistentContent();
    if (idbContent && idbContent.company) {
      if (!localContent || (idbContent.updatedAt && idbContent.updatedAt >= localTimestamp)) {
        localContent = idbContent;
        localTimestamp = Math.max(localTimestamp, idbContent.updatedAt || 0);
      }
    }
  } catch {}

  // 1. Try Cloud Firestore with local-first priority
  try {
    const cloudContent = await getSiteContentFromFirestore();
    if (cloudContent && cloudContent.company) {
      const cloudTimestamp = Number((cloudContent as any).updatedAt || 0);
      if (localContent && localTimestamp >= cloudTimestamp - 2000) {
        // Local is fresher, keep local and sync to cloud in background
        saveSiteContentToFirestore(localContent).catch(() => {});
        fetch('/api/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localContent),
        }).catch(() => {});
        return localContent;
      }

      if (cloudTimestamp > localTimestamp + 2000) {
        try {
          localStorage.setItem('cotton_nest_site_content', JSON.stringify(cloudContent));
          localStorage.setItem('cotton_nest_site_content_updated_at', String(cloudTimestamp));
        } catch {}
        savePersistentContent(cloudContent).catch(() => {});
        return cloudContent;
      }
    }
  } catch {}

  // 2. If local exists, use it!
  if (localContent) {
    fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localContent),
    }).catch(() => {});
    return localContent;
  }

  // 3. Try Backend Server
  try {
    const res = await fetch('/api/content');
    if (res.ok) {
      const data = await res.json();
      if (data && data.company) {
        try {
          localStorage.setItem('cotton_nest_site_content', JSON.stringify(data));
          localStorage.setItem('cotton_nest_site_content_updated_at', String(Date.now()));
        } catch {}
        savePersistentContent(data).catch(() => {});
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend content fetch failed, using cached content:', err);
  }

  return INITIAL_SITE_CONTENT;
}

export async function saveSiteContentApi(content: SiteContent): Promise<void> {
  const saveTimestamp = Date.now();
  const stampedContent = {
    ...content,
    updatedAt: saveTimestamp,
  };

  try {
    localStorage.setItem('cotton_nest_site_content', JSON.stringify(stampedContent));
    localStorage.setItem('cotton_nest_site_content_updated_at', String(saveTimestamp));
  } catch {}

  savePersistentContent(stampedContent).catch(() => {});

  await Promise.allSettled([
    saveSiteContentToFirestore(stampedContent).catch(() => {}),
    fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stampedContent),
    }).catch((err) => console.warn('Failed to sync content to server:', err)),
  ]);
}
