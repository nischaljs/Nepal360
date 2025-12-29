# Campaign File Upload Configuration

## Setup Instructions

### 1. Install Dependencies
```bash
pnpm install
```

This will install `multer` and `@types/multer` needed for file handling.

### 2. Create Uploads Directory (Auto-created on server start)
The server automatically creates the uploads directory on startup:
```
uploads/
└── campaigns/
    └── {campaignId}/
        ├── cover-image files
        └── proof files
```

### 3. File Upload Limits & Types

**Cover Image:**
- Max size: 5MB
- Allowed types: JPEG, PNG, WebP, GIF

**Proof Files:**
- Max size: 20MB per file
- Max count: 10 files per campaign
- Allowed types: Images (JPEG, PNG, WebP, GIF), Videos (MP4, WebM, QuickTime), Documents (PDF, DOC, DOCX)

### 4. Database Storage

**Relative Paths in DB:**
- Cover image: `campaigns/{campaignId}/filename-timestamp.ext`
- Proof files stored as JSON array: `["campaigns/{campaignId}/file1.ext", "campaigns/{campaignId}/file2.ext"]`

**API Responses:**
- Complete URLs are automatically generated: `http://localhost:3000/uploads/campaigns/{campaignId}/filename.ext`

### 5. Engagement Metrics

Each campaign now tracks:
- **donationCount**: Number of donations received
- **shareCount**: Number of social media shares
- **viewCount**: Total campaign views

## File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── multer.ts          # Multer configuration
│   ├── controllers/
│   │   └── campaign.controller.ts  # Updated with file handling
│   ├── routes/
│   │   └── campaign.routes.ts      # Updated with multer middleware
│   ├── schemas/
│   │   └── campaign.schema.ts      # Zod validation schemas
│   ├── types/
│   │   └── campaign.types.ts       # TypeScript interfaces
│   └── utils/
│       ├── file.ts            # File utility functions
│       └── ...
├── uploads/
│   └── campaigns/    # Auto-created, store in .gitignore
└── apis/
    └── CAMPAIGN.rest  # API documentation
```

## API Usage

### Creating a Campaign with Files

Use `multipart/form-data`:

```bash
curl -X POST http://localhost:3000/api/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Medical Fund" \
  -F "description=Help us raise funds..." \
  -F "targetAmount=50000" \
  -F "coverImage=@/path/to/image.jpg" \
  -F "proofs=@/path/to/proof1.pdf" \
  -F "proofs=@/path/to/proof2.jpg"
```

### Response Example

```json
{
  "success": true,
  "campaign": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "beneficiary": {
      "id": "e109c74d-c53f-4a0d-9098-bbda3f3ec734",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "coverImage": "http://localhost:3000/uploads/campaigns/550e8400-e29b-41d4-a716-446655440000/image-1735411200000.jpg",
    "proofLinks": [
      "http://localhost:3000/uploads/campaigns/550e8400-e29b-41d4-a716-446655440000/proof1-1735411200000.pdf"
    ],
    "donationCount": 0,
    "shareCount": 0,
    "viewCount": 0,
    ...
  }
}
```

## Key Features

✅ **File Upload Handling**: Uses multer for secure file uploads
✅ **Organized Storage**: Files organized by campaign ID
✅ **URL Generation**: Automatic complete URL generation in responses
✅ **Validation**: Zod schemas for all inputs
✅ **Beneficiary Info**: Organizer details included in responses
✅ **Engagement Tracking**: Tracks donations, shares, and views
✅ **Error Handling**: Comprehensive error messages with validation details
✅ **Security**: File type validation, size limits, secure storage

## Testing

Use the [CAMPAIGN.rest](/apis/CAMPAIGN.rest) file to test all endpoints with the REST Client extension in VS Code.

## Notes

- Uploads folder should be added to `.gitignore`
- Files are served statically from `/uploads` route
- Database stores only relative paths; complete URLs are generated on API responses
- Temp files are created during upload and moved to campaign directory after creation
- Each file gets a timestamp suffix to avoid name conflicts
