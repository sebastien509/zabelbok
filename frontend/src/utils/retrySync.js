// ✅ src/utils/retrySync.js

export async function retrySync(queueKey, endpoint) {
  const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
  if (queue.length === 0) return;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}` // if using JWT
      },
      body: JSON.stringify({ submissions: queue })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[RetrySync] Server rejected sync:`, errorData);
      return;
    }

    console.log(`[RetrySync] Synced ${queue.length} items to ${endpoint}`);
    localStorage.removeItem(queueKey); // clear only if success
  } catch (err) {
    console.error(`[RetrySync] Failed to sync`, err);
  }
}
