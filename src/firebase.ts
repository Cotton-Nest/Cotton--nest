import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { BedsheetProduct } from './data/products';
import { Order } from './data/orders';
import { SiteContent } from './data/siteContent';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Validate connection per skill instructions
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Connected to Google Cloud Firestore successfully!');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, check connection.');
    }
  }
}
testConnection();

/* ---------------- FIRESTORE PERSISTENCE HELPERS ---------------- */

// 1. Permanent Custom Images Store (Guarantees photos NEVER reset across devices or restarts)
export async function saveImageToFirestore(productId: string, imageUrl: string): Promise<void> {
  try {
    const docRef = doc(db, 'custom_images', productId);
    await setDoc(docRef, {
      productId,
      imageUrl,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Failed to save image to Firestore:', err);
  }
}

export async function getAllImagesFromFirestore(): Promise<Record<string, string>> {
  try {
    const colRef = collection(db, 'custom_images');
    const snap = await getDocs(colRef);
    const result: Record<string, string> = {};
    snap.forEach((d) => {
      const data = d.data();
      if (data && data.imageUrl) {
        result[d.id] = data.imageUrl;
      }
    });
    return result;
  } catch (err) {
    console.warn('Failed to fetch images from Firestore:', err);
    return {};
  }
}

// Quota circuit-breaker: if Google Cloud Firestore free daily quota is exceeded,
// back off temporarily so client operations (IndexedDB & server DB) are fast and uninterrupted
function getInitialQuotaExhaustedUntil(): number {
  try {
    const val = sessionStorage.getItem('cotton_nest_firestore_quota_until');
    return val ? Number(val) : 0;
  } catch {
    return 0;
  }
}
let firestoreQuotaExhaustedUntil = getInitialQuotaExhaustedUntil();

export function isFirestoreQuotaExhausted(): boolean {
  return Date.now() < firestoreQuotaExhaustedUntil;
}

function handleFirestoreError(err: any, context: string) {
  if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded') || err?.message?.includes('resource-exhausted')) {
    firestoreQuotaExhaustedUntil = Date.now() + 30 * 60 * 1000; // 30 minute back-off
    try {
      sessionStorage.setItem('cotton_nest_firestore_quota_until', String(firestoreQuotaExhaustedUntil));
    } catch {}
    console.warn(`Firestore free quota limit reached in ${context}. Seamlessly using local disk & IndexedDB storage.`);
  } else {
    console.warn(`Firestore error in ${context}:`, err);
  }
}

// Sanitization helper: Strips any undefined fields so Firestore setDoc never throws Unsupported field value: undefined
export function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// 2. Products Store
export async function getProductsFromFirestore(): Promise<BedsheetProduct[] | null> {
  if (isFirestoreQuotaExhausted()) return null;
  try {
    const colRef = collection(db, 'products');
    const snap = await getDocs(colRef);
    if (snap.empty) return null;
    const items: BedsheetProduct[] = [];
    snap.forEach((d) => {
      items.push(d.data() as BedsheetProduct);
    });
    return items.length > 0 ? items : null;
  } catch (err) {
    handleFirestoreError(err, 'getProductsFromFirestore');
    return null;
  }
}

export async function saveProductToFirestore(product: BedsheetProduct): Promise<void> {
  if (isFirestoreQuotaExhausted()) return;
  try {
    const sanitized = sanitizeForFirestore(product);
    const docRef = doc(db, 'products', product.id);
    await setDoc(docRef, sanitized);
  } catch (err) {
    handleFirestoreError(err, 'saveProductToFirestore');
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  if (isFirestoreQuotaExhausted()) return;
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, 'deleteProductFromFirestore');
  }
}

export async function saveAllProductsToFirestore(products: BedsheetProduct[]): Promise<void> {
  if (isFirestoreQuotaExhausted()) return;
  try {
    const cleanProducts = products.map((p, idx) => ({
      ...p,
      order: typeof p.order === 'number' ? p.order : idx,
      updatedAt: p.updatedAt || Date.now(),
    }));
    const sanitized = sanitizeForFirestore(cleanProducts);

    // Save/update each product without burning collection read quota
    await Promise.all(
      sanitized.map((p) => {
        const docRef = doc(db, 'products', p.id);
        return setDoc(docRef, p);
      })
    );
  } catch (err) {
    handleFirestoreError(err, 'saveAllProductsToFirestore');
  }
}

// 3. Orders Store
export async function getOrdersFromFirestore(): Promise<Order[] | null> {
  if (isFirestoreQuotaExhausted()) return null;
  try {
    const colRef = collection(db, 'orders');
    const snap = await getDocs(colRef);
    if (snap.empty) return null;
    const items: Order[] = [];
    snap.forEach((d) => {
      items.push(d.data() as Order);
    });
    return items;
  } catch (err) {
    handleFirestoreError(err, 'getOrdersFromFirestore');
    return null;
  }
}

export async function saveOrderToFirestore(order: Order): Promise<void> {
  if (isFirestoreQuotaExhausted()) return;
  try {
    const sanitized = sanitizeForFirestore(order);
    const docRef = doc(db, 'orders', order.id);
    await setDoc(docRef, sanitized);
  } catch (err) {
    handleFirestoreError(err, 'saveOrderToFirestore');
  }
}

// 4. Site Content Store
export async function getSiteContentFromFirestore(): Promise<SiteContent | null> {
  if (isFirestoreQuotaExhausted()) return null;
  try {
    const docRef = doc(db, 'site_content', 'main');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SiteContent;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, 'getSiteContentFromFirestore');
    return null;
  }
}

export async function saveSiteContentToFirestore(content: SiteContent): Promise<void> {
  if (isFirestoreQuotaExhausted()) return;
  try {
    const sanitized = sanitizeForFirestore(content);
    const docRef = doc(db, 'site_content', 'main');
    await setDoc(docRef, sanitized);
  } catch (err) {
    handleFirestoreError(err, 'saveSiteContentToFirestore');
  }
}
