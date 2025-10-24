# Cloudflare Workers API Migration

## Overview

This document describes the migration of public API endpoints to Cloudflare Workers while maintaining the existing admin API for authenticated operations.

## Migration Date

2025-10-23

## Architecture Changes

### Before Migration

```
All API requests → https://api.bumsiku.kr
- Public read operations (posts, tags, comments)
- Admin write operations (create, update, delete)
- Authentication endpoints
```

### After Migration

```
Public read operations → https://public-worker.peter012677.workers.dev
- GET /posts (list)
- GET /posts/{id} (detail)
- GET /tags
- GET /comments/{postId}
- POST /comments/{postId} (anonymous commenting)
- GET /sitemap

Admin operations → https://api.bumsiku.kr (unchanged)
- POST /admin/posts (create)
- PUT /admin/posts/{id} (update)
- DELETE /admin/posts/{id} (delete)
- POST /admin/images (upload)
- POST /auth/login
- POST /ai/* (AI features)
- DELETE /admin/comments/{id}
```

## Implementation Details

### 1. Environment Variables

**File: `.env.local`**

```bash
# Admin API: Authentication, write operations
NEXT_PUBLIC_API_URL=https://api.bumsiku.kr

# Public API: Read-only operations via Cloudflare Workers
NEXT_PUBLIC_PUBLIC_API_URL=https://public-worker.peter012677.workers.dev
```

### 2. API Client Changes

**File: `src/lib/api/client.ts`**

#### New Types

```typescript
export type APIDomain = 'admin' | 'public';

export interface APIRequestConfig extends AxiosRequestConfig {
  domain?: APIDomain;
}
```

#### Dual Client Architecture

- **adminClient**: Uses `NEXT_PUBLIC_API_URL`, includes authentication, requires credentials
- **publicClient**: Uses `NEXT_PUBLIC_PUBLIC_API_URL`, no authentication, no credentials

#### Request Routing

```typescript
private getClient(domain: APIDomain = 'admin'): AxiosInstance {
  return domain === 'public' ? this.publicClient : this.adminClient;
}
```

All requests now accept `domain: 'public' | 'admin'` parameter to route to appropriate API.

### 3. Service Layer Updates

#### PostsService (`src/lib/api/posts.ts`)

**Public domain (Cloudflare Workers):**
- `getList()` - List posts with pagination
- `getOne()` - Get post by ID
- `getBySlug()` - Get post by slug
- `getSitemap()` - Generate sitemap

**Admin domain (existing API):**
- `create()` - Create new post
- `update()` - Update existing post
- `delete()` - Delete post
- `incrementViews()` - Increment view count (PATCH)

#### TagsService (`src/lib/api/tags.ts`)

**Public domain (Cloudflare Workers):**
- `getList()` - Get all tags

#### CommentsService (`src/lib/api/comments.ts`)

**Public domain (Cloudflare Workers):**
- `getByPostId()` - Get comments for a post
- `create()` - Create comment (anonymous commenting)

**Admin domain (existing API):**
- `delete()` - Delete comment (admin only)

### 4. Benefits

#### Performance
- **Edge Computing**: Cloudflare Workers serve from CDN edge locations worldwide
- **Reduced Latency**: Lower response times for public read operations
- **Shorter Timeout**: 30s for public API vs 60s for admin API

#### Security
- **No Credentials**: Public API doesn't need authentication cookies
- **Attack Surface**: Reduced exposure of admin API to public traffic
- **DDoS Protection**: Cloudflare's built-in protection for public endpoints

#### Scalability
- **Unlimited Scaling**: Cloudflare Workers handle traffic spikes automatically
- **Cost Efficiency**: Pay-per-request model for public traffic
- **Backend Relief**: Reduced load on main API server

### 5. Migration Checklist

- [x] Add `NEXT_PUBLIC_PUBLIC_API_URL` environment variable
- [x] Update APIClient with dual-domain support
- [x] Update PostsService for public domain reads
- [x] Update TagsService for public domain
- [x] Update CommentsService for mixed domain usage
- [x] Run type check and production build
- [x] Create migration documentation

### 6. Testing Requirements

#### Public Pages (should use Cloudflare Workers)
- `/` - Home page (posts list)
- `/posts/[slug]` - Post detail page
- `/posts/[slug]#comments` - Comments section

**Expected behavior:**
- Network tab should show requests to `public-worker.peter012677.workers.dev`
- No authentication headers in requests
- Fast response times from CDN edge

#### Admin Pages (should use existing API)
- `/admin` - Admin dashboard
- `/admin/posts` - Posts management
- `/admin/posts/new` - Create new post
- `/admin/posts/edit/[id]` - Edit post
- `/admin/comments` - Comments management

**Expected behavior:**
- Network tab should show requests to `api.bumsiku.kr`
- Authorization headers present in requests
- Session cookies included

### 7. Rollback Plan

If issues arise, rollback is simple:

1. Remove `NEXT_PUBLIC_PUBLIC_API_URL` from `.env.local`
2. APIClient will fallback to `NEXT_PUBLIC_API_URL` for all requests
3. Deploy previous version from `master` branch

No database changes or infrastructure changes are required.

### 8. Cloudflare Workers Requirements

The Cloudflare Workers endpoint must support:

#### Endpoints
- `GET /posts?page={page}&size={size}&sort={sort}&tag={tag}`
- `GET /posts/{identifier}` (by ID or slug)
- `GET /tags`
- `GET /comments/{postId}`
- `POST /comments/{postId}`
- `GET /sitemap`

#### CORS Configuration
```javascript
headers: {
  'Access-Control-Allow-Origin': 'https://bumsiku.kr',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}
```

#### Response Format
Must match existing API response format:
```typescript
{
  success: boolean;
  data: T;
  error?: {
    message: string;
    code?: string;
  }
}
```

### 9. Monitoring

#### Metrics to Track
- Public API response times (target: < 200ms from edge)
- Admin API response times (existing baseline)
- Error rates for both domains
- Cache hit rates (Cloudflare Workers cache)
- Cost per request (Cloudflare Workers billing)

#### Logging
Both clients include detailed logging:
- Request logs: URL, method, params
- Response logs: Status, URL
- Error logs: Message, status, URL

### 10. Future Enhancements

#### Potential Improvements
- Add caching headers for static content
- Implement stale-while-revalidate strategy
- Add request rate limiting at edge
- Implement A/B testing at edge
- Add analytics at edge layer

#### Additional Migration Candidates
Consider migrating these to Cloudflare:
- Image optimization and delivery
- Static asset serving
- RSS feed generation
- Search functionality (if added)

## Related Files

- `src/lib/api/client.ts` - Dual-domain API client
- `src/lib/api/posts.ts` - Posts service with domain routing
- `src/lib/api/tags.ts` - Tags service (public only)
- `src/lib/api/comments.ts` - Comments service (mixed)
- `.env.local` - Environment configuration
- `CLAUDE.md` - Project documentation (update needed)

## Questions & Support

For questions about this migration, refer to:
- Architecture documentation: `docs/01-architecture-overview.md`
- Data flow guide: `docs/02-data-flow-and-state-management.md`
- Developer guide: `docs/03-developer-guide.md`
