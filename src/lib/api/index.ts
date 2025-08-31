import { APIClient } from './client';
import { PostsService } from './posts';
import { CategoriesService } from './categories';
import { CommentsService } from './comments';
import { ImagesService, AuthService } from './admin';

// APIClient 인스턴스 생성
const apiClient = APIClient.getInstance();

// 서비스 인스턴스들 생성
const postsService = new PostsService(apiClient);
const categoriesService = new CategoriesService(apiClient);
const commentsService = new CommentsService(apiClient);
const imagesService = new ImagesService(apiClient);
const authService = new AuthService(apiClient);

// 통합된 API 객체 생성
export const api = {
  posts: postsService,
  categories: categoriesService,
  comments: commentsService,
  images: imagesService,
  auth: authService,
};
