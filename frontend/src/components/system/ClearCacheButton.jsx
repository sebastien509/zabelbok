export default function ClearCacheButton() {
    const clearAll = async () => {
      await caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
      localStorage.clear();
      alert('Cache + LocalStorage cleared!');
    };
    return <button className="text-sm text-red-600 underline" onClick={clearAll}>Clear Cache</button>;
  }