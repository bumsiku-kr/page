import { APIClient } from './client';
import { AIService } from './ai';
import { PostsService } from './posts';
import { TagsService } from './tags';
import { CommentsService } from './comments';
import { ImagesService, AuthService as AdminAuthService } from './admin';
import { AuthService } from './auth';

// APIClient 인스턴스 생성
const apiClient = APIClient.getInstance();

// 서비스 인스턴스들 생성
const postsService = new PostsService(apiClient);
const aiService = new AIService(apiClient);
const tagsService = new TagsService(apiClient);
const commentsService = new CommentsService(apiClient);
const imagesService = new ImagesService(apiClient);
const adminAuthService = new AdminAuthService(apiClient);
const authService = new AuthService(apiClient);

// 통합된 API 객체 생성
export const api = {
  posts: postsService,
  tags: tagsService,
  comments: commentsService,
  images: imagesService,
  adminAuth: adminAuthService,
  auth: authService,
  ai: aiService,
};
