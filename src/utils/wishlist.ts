/**
 * Wishlist utility with localStorage persistence and cross-component sync
 */

const WISHLIST_STORAGE_KEY = 'cotton_nest_wishlist';
const WISHLIST_EVENT = 'cotton_nest_wishlist_updated';

export function getWishlist(): string[] {
  try {
    const data = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function isWishlisted(productId: string): boolean {
  const list = getWishlist();
  return list.includes(productId);
}

export function toggleWishlistItem(productId: string): boolean {
  try {
    const list = getWishlist();
    const index = list.indexOf(productId);
    let nextList: string[];
    let added = false;
    if (index >= 0) {
      nextList = list.filter((id) => id !== productId);
      added = false;
    } else {
      nextList = [...list, productId];
      added = true;
    }
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(nextList));
    window.dispatchEvent(new CustomEvent(WISHLIST_EVENT, { detail: { wishlist: nextList, productId, added } }));
    return added;
  } catch {
    return false;
  }
}

export function onWishlistChange(callback: (list: string[]) => void): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    if (custom.detail?.wishlist) {
      callback(custom.detail.wishlist);
    } else {
      callback(getWishlist());
    }
  };
  window.addEventListener(WISHLIST_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(WISHLIST_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
