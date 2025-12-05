# Prime Couture Admin Dashboard

Run dev:

```
cd client/admin
npm install
npm run dev
```

Env (`client/admin/.env.local`):

```
VITE_API_BASE_URL=http://localhost:3000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=unsigned_upload_preset
```

Notes:
- Uses Rubik font, small UI sizing.
- JWT auth (`/auth/login` + `/auth/me`); sidebar shows user/role.
- Products page includes create product, create collection/category, and image upload (via Cloudinary) flows.
