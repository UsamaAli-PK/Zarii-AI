const { google } = require('googleapis');
const config = require('../config');

/**
 * Google Indexing API Service
 * Triggers Google to crawl specific URLs immediately (within 24 hours).
 * Requires GOOGLE_INDEXING_CREDENTIALS (service account JSON) in env.
 */

async function notifyGoogle(url, type = 'URL_UPDATED') {
  if (!config.GOOGLE_INDEXING_CREDENTIALS) {
    console.warn('[Indexing] Skipping: GOOGLE_INDEXING_CREDENTIALS not set');
    return;
  }

  try {
    const credentials = JSON.parse(config.GOOGLE_INDEXING_CREDENTIALS);
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/indexing'],
      null
    );

    const indexing = google.indexing('v3');
    
    const res = await indexing.urlNotifications.publish({
      auth,
      requestBody: {
        url,
        type,
      },
    });

    console.log(`[Indexing] ${type} success: ${url} (ID: ${res.data.urlNotificationMetadata?.latestUpdate?.notificationId})`);
    return res.data;
  } catch (err) {
    console.error(`[Indexing] Error notifying Google for ${url}:`, err.message);
  }
}

/**
 * Batch notify for multiple URLs.
 * Note: Indexing API has strict quotas (default 200/day).
 */
async function notifyBatch(urls) {
  for (const url of urls) {
    await notifyGoogle(url);
  }
}

module.exports = { notifyGoogle, notifyBatch };
