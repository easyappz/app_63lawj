from django.urls import path
from api.views import (
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    PostListView,
    PostCreateView,
    PostDetailView,
    PostDeleteView,
    PostLikeView,
    CommentListView,
    CommentCreateView,
    CommentDeleteView,
    ProfileDetailView,
    ProfileUpdateView
)

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    
    # Posts endpoints
    path('posts/', PostListView.as_view(), name='posts-list'),
    path('posts/create/', PostCreateView.as_view(), name='posts-create'),
    path('posts/<int:id>/', PostDetailView.as_view(), name='posts-detail'),
    path('posts/<int:id>/delete/', PostDeleteView.as_view(), name='posts-delete'),
    path('posts/<int:id>/like/', PostLikeView.as_view(), name='posts-like'),
    
    # Comments endpoints
    path('posts/<int:post_id>/comments/', CommentListView.as_view(), name='comments-list'),
    path('posts/<int:post_id>/comments/create/', CommentCreateView.as_view(), name='comments-create'),
    path('comments/<int:id>/', CommentDeleteView.as_view(), name='comments-delete'),
    
    # Profile endpoints
    path('profile/<int:id>/', ProfileDetailView.as_view(), name='profile-detail'),
    path('profile/', ProfileUpdateView.as_view(), name='profile-update'),
]
