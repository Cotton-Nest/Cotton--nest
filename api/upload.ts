import { v2 as cloudinary } from 'cloudinary';

function getCloudinaryConfig() {
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
  let apiKey = process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY;
  let apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (cloudinaryUrl) {
    const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    if (match) {
      apiKey = apiKey || match[1];
      apiSecret = apiSecret || match[2];
      cloudName = cloudName || match[3];
    }
  }

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return { cloudName, apiKey, apiSecret };
  }

  return null;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }

    const { image, productId, public_id } = body || {};

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Image data (base64 data URI or URL) is required.' });
    }

    // If it is already a Cloudinary URL, return directly
    if (image.startsWith('https://res.cloudinary.com/')) {
      return res.status(200).json({
        url: image,
        public_id: public_id || null,
        provider: 'cloudinary',
        message: 'Already hosted on Cloudinary'
      });
    }

    const config = getCloudinaryConfig();
    if (!config) {
      return res.status(503).json({
        configured: false,
        error: 'Cloudinary credentials are not configured on the server.',
        help: 'Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (or CLOUDINARY_URL) in your deployment environment variables.',
      });
    }

    const uploadOptions: any = {
      folder: 'cotton_nest/bedsheets',
      resource_type: 'image',
      overwrite: true,
      tags: ['cotton_nest', productId ? `product_${productId}` : 'general_sheet'],
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    };

    if (public_id) {
      uploadOptions.public_id = public_id;
    } else if (productId) {
      const sanitized = productId.replace(/[^a-zA-Z0-9-_]/g, '_');
      uploadOptions.public_id = `sheet_${sanitized}_${Date.now()}`;
    }

    const result = await cloudinary.uploader.upload(image, uploadOptions);

    return res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      provider: 'cloudinary'
    });
  } catch (err: any) {
    console.error('Cloudinary upload error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to upload image to Cloudinary.',
    });
  }
}
