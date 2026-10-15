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

// Direct Firebase Store scratch helpers
export {
  fetchProductsFromFirestore,
  fetchCustomImagesFromFirestore,
  uploadAndSaveProductImage,
  saveProductDetailsToFirestore,
  saveAllProductsToFirestoreService,
  deleteProductFromFirestoreService,
  subscribeToProductsRealtime
} from './firebaseStore';

// Upload Image API: Compresses image and persists directly to Firebase Firestore and IndexedDB
export async function uploadImageApi(imageInput: string | File, productId?: string): Promise<string> {
  try {
    // If it's already an existing data URL or remote URL, use as is
    if (typeof imageInput === 'string' && (imageInput.startsWith('data:image/') || imageInput.startsWith('http://') || imageInput.startsWith('https://'))) {
      if (productId) {
        saveImageToFirestore(productId, imageInput).catch(() => {});
        savePersistentImage(productId, imageInput).catch(() => {});
      }
      return imageInput;
    }

    // 1. Compress image client-side to lightweight JPEG (~70KB-120KB)
    // Storing the self-contained data URL ensures photos NEVER 404 across devices, phones, or server restarts!
    const compressed = await compressImage(imageInput, 1280, 1280, 0.82);

    // 2. Primary cloud storage: Store permanently in Google Cloud Firestore & IndexedDB
    // Giving strict preference to Firebase ensures all devices receive this photo instantly
    if (productId && compressed) {
      await saveImageToFirestore(productId, compressed).catch(() => {});
      savePersistentImage(productId, compressed).catch(() => {});
    }

    // 3. Background server disk backup copy (non-blocking)
    fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: compressed }),
    }).catch(() => {});

    return compressed;
  } catch (err) {
    console.warn('Upload API failed, falling back:', err);
    if (typeof imageInput === 'string') return imageInput;
    return await compressImage(imageInput, 1280, 1280, 0.82);
  }
}

// Products API: Loads authoritative data giving direct preference to Google Cloud Firestore
export async function getProducts(): Promise<BedsheetProduct[]> {
  // 1. Gather all persistent custom photos (Firestore Cloud + Local IndexedDB)
  // Firebase Firestore is strictly preferred over local device cache
  let persistentImages: Record<string, string> = {};
  try {
    const [localImgs, cloudImgs] = await Promise.all([
      getAllPersistentImages().catch(() => ({})),
      getAllImagesFromFirestore().catch(() => ({})),
    ]);
    persistentImages = { ...localImgs, ...cloudImgs };
  } catch {}

  // 2. Read local cache from BOTH localStorage AND IndexedDB (as fallback)
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

  // Select freshest local dataset
  if (idbProducts && (!localProducts || idbTimestamp >= localTimestamp)) {
    localProducts = idbProducts;
    localTimestamp = Math.max(localTimestamp, idbTimestamp);
  }

  // 3. Fetch BOTH Central Backend Server API AND Google Cloud Firestore in parallel
  // 3. Fetch BOTH Central Backend Server API AND Google Cloud Firestore in parallel with cache-busting
  const [serverRes, cloudProducts] = await Promise.allSettled([
    fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
    getProductsFromFirestore(),
  ]);

  const serverProducts: BedsheetProduct[] | null =
    serverRes.status === 'fulfilled' && Array.isArray(serverRes.value) && serverRes.value.length > 0
      ? serverRes.value
      : null;

  const validCloudProducts: BedsheetProduct[] | null =
    cloudProducts.status === 'fulfilled' && Array.isArray(cloudProducts.value) && cloudProducts.value.length > 0
      ? cloudProducts.value
      : null;

  const serverTime = serverProducts && serverProducts.length > 0
    ? Math.max(...serverProducts.map((p) => p.updatedAt || 0), 0)
    : 0;

  const cloudTime = validCloudProducts && validCloudProducts.length > 0
    ? Math.max(...validCloudProducts.map((p) => p.updatedAt || 0), 0)
    : 0;

  // 4. Determine authoritative dataset: Firebase Firestore is given primary preference!
  let authoritativeRemote: BedsheetProduct[] | null = null;
  if (validCloudProducts && validCloudProducts.length > 0) {
    // If local server has newer offline changes, propagate them up to Firebase Firestore
    if (serverProducts && serverProducts.length > 0 && serverTime > cloudTime) {
      authoritativeRemote = serverProducts;
      saveAllProductsToFirestore(serverProducts).catch(() => {});
    } else {
      authoritativeRemote = validCloudProducts;
    }
  } else if (serverProducts && serverProducts.length > 0) {
    authoritativeRemote = serverProducts;
    saveAllProductsToFirestore(serverProducts).catch(() => {});
  }

  const remoteTimestamp = authoritativeRemote
    ? Math.max(...authoritativeRemote.map((p) => p.updatedAt || 0), 0)
    : 0;

  // 5. Cross-device synchronization logic:
  // If remote dataset exists, REMOTE IS AUTHORITATIVE!
  if (authoritativeRemote && authoritativeRemote.length > 0) {
    const isOwnerDevice = typeof window !== 'undefined' && localStorage.getItem('cotton_nest_owner_mode') === 'true';
    if (isOwnerDevice && localProducts && localProducts.length > 0 && localTimestamp > remoteTimestamp + 2000) {
      saveAllProducts(localProducts).catch(() => {});
      return localProducts.map((p) => ({
        ...p,
        image: resolveBedsheetImage(p.image, p.id, p.updatedAt),
      }));
    }

    // Remote dataset wins! Keep order consistent
    const orderMap = new Map(BEDSHEETS_CATALOG.map((p, idx) => [p.id, idx]));
    authoritativeRemote.sort((a, b) => {
      const orderA = typeof (a as any).order === 'number' ? (a as any).order : (orderMap.get(a.id) ?? 999);
      const orderB = typeof (b as any).order === 'number' ? (b as any).order : (orderMap.get(b.id) ?? 999);
      return orderA - orderB;
    });

    const cleanMerged = authoritativeRemote.map((p) => {
      const finalPhoto = p.image || persistentImages[p.id];
      return {
        ...p,
        image: resolveBedsheetImage(finalPhoto, p.id, p.updatedAt),
      };
    });

    // Update local cache so this device stays synced with PC edits
    try {
      const lightweight = cleanMerged.map((p) =>
        p.image?.startsWith('data:') ? { ...p, image: `/photo/${p.id}.jpg` } : p
      );
      localStorage.setItem('cotton_nest_products', JSON.stringify(lightweight));
      localStorage.setItem('cotton_nest_products_updated_at', String(remoteTimestamp || Date.now()));
    } catch {}

    savePersistentProducts(cleanMerged, remoteTimestamp || Date.now()).catch(() => {});

    // Sync persistent images store so other components find the latest photo
    cleanMerged.forEach((p) => {
      if (p.image && !p.image.startsWith('/images/exact_sheet')) {
        savePersistentImage(p.id, p.image).catch(() => {});
      }
    });

    return cleanMerged;
  }

  // 6. Secondary: Local Storage / IndexedDB (when completely offline)
  if (localProducts && localProducts.length > 0) {
    return localProducts.map((p) => ({
      ...p,
      image: resolveBedsheetImage(p.image, p.id, p.updatedAt),
    }));
  }

  // 7. Absolute initial fallback: default catalog
  return BEDSHEETS_CATALOG.map((p, idx) => ({
    ...p,
    order: idx,
    image: resolveBedsheetImage(p.image, p.id),
    updatedAt: 1,
  }));
}

export async function saveAllProducts(products: BedsheetProduct[]): Promise<void> {
  const saveTimestamp = Date.now();
  // Ensure each product carries its permanent order position and fresh save timestamp
  const orderedProducts = products.map((p, idx) => ({
    ...p,
    order: typeof p.order === 'number' ? p.order : idx,
    updatedAt: saveTimestamp,
  }));

  // 1. Synchronous localStorage cache save
  try {
    localStorage.setItem('cotton_nest_products', JSON.stringify(orderedProducts));
    localStorage.setItem('cotton_nest_products_updated_at', String(saveTimestamp));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }

  // 2. Primary: Persist immediately to Firebase Firestore so mobile website updates in real-time
  try {
    await saveAllProductsToFirestore(orderedProducts);
  } catch (err) {
    console.warn('Firestore primary sync warning:', err);
  }

  // 3. Mirror to IndexedDB and local backend server disk DB
  await Promise.allSettled([
    savePersistentProducts(orderedProducts, saveTimestamp),
    fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderedProducts),
    }).catch((err) => console.warn('Server sync warning:', err)),
  ]);
}

export async function addProduct(product: BedsheetProduct): Promise<BedsheetProduct> {
  await saveProductToFirestore(product).catch(() => {});
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
  // Save directly to Firebase Firestore
  try {
    await saveProductToFirestore({ id, ...product } as BedsheetProduct);
  } catch (err) {
    console.warn('Failed to update product in Firestore:', err);
  }

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
