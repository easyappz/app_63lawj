from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404

from api.models import Member, Post, Like, Comment
from api.serializers import (
    MemberSerializer,
    MemberRegistrationSerializer,
    MemberLoginSerializer,
    MemberProfileUpdateSerializer,
    PostSerializer,
    PostCreateSerializer,
    CommentSerializer,
    CommentCreateSerializer,
    ProfileSerializer
)


class CookieAuthentication(BaseAuthentication):
    """
    Custom authentication class that authenticates users via HttpOnly cookie.
    Cookie name: 'session_id', value: member_id
    """
    def authenticate(self, request):
        session_id = request.COOKIES.get('session_id')
        
        if not session_id:
            return None
        
        try:
            member = Member.objects.get(id=session_id)
            return (member, None)
        except (Member.DoesNotExist, ValueError):
            raise AuthenticationFailed('Invalid session')


class RegisterView(APIView):
    """
    POST /api/auth/register/ - Register a new user
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = MemberRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            member = serializer.save()
            return Response(
                MemberSerializer(member).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/auth/login/ - Login user and set HttpOnly cookie
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = MemberLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        try:
            member = Member.objects.get(email=email)
        except Member.DoesNotExist:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not member.check_password(password):
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        response = Response(
            MemberSerializer(member).data,
            status=status.HTTP_200_OK
        )
        response.set_cookie(
            key='session_id',
            value=str(member.id),
            httponly=True,
            samesite='Lax',
            path='/'
        )
        return response


class LogoutView(APIView):
    """
    POST /api/auth/logout/ - Logout user and delete cookie
    """
    authentication_classes = [CookieAuthentication]

    def post(self, request):
        if not request.user:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        response = Response(
            {'message': 'Successfully logged out'},
            status=status.HTTP_200_OK
        )
        response.delete_cookie('session_id', path='/')
        return response


class MeView(APIView):
    """
    GET /api/auth/me/ - Get current authenticated user
    """
    authentication_classes = [CookieAuthentication]

    def get(self, request):
        if not request.user:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        serializer = MemberSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PostListCreateView(APIView):
    """
    GET /api/posts/ - Get paginated list of posts
    POST /api/posts/ - Create a new post
    """
    authentication_classes = [CookieAuthentication]

    def get(self, request):
        if not request.user:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        page = request.GET.get('page', 1)
        page_size = min(int(request.GET.get('page_size', 20)), 100)
        
        posts = Post.objects.all().select_related('author').prefetch_related('likes', 'comments')
        paginator = Paginator(posts, page_size)
        page_obj = paginator.get_page(page)
        
        serializer = PostSerializer(
            page_obj.object_list,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'count': paginator.count,
            'next': f'/api/posts/?page={page_obj.next_page_number()}' if page_obj.has_next() else None,
            'previous': f'/api/posts/?page={page_obj.previous_page_number()}' if page_obj.has_previous() else None,
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        if not request.user:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        serializer = PostCreateSerializer(data=request.data)
        if serializer.is_valid():
            post = serializer.save(author=request.user)
            return Response(
                PostSerializer(post, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostDetailView(APIView):
    """
    GET /api/posts/{id}/ - Get a single post
    DELETE /api/posts/{id}/ - Delete a post (author only)
    """
    authentication_classes = [CookieAuthentication]

    def get(self, request, id):
        if not request.user:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        post = get_object_or_404(Post, id=id)
        serializer = PostSerializer(post, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, id):
        if not request.user:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        post = get_object_or_404(Post, id=id)
        
        if post.author.id != request.user.id:
            return Response(
                {'error': 'You are not authorized to delete this post'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PostLikeView(APIView):
    """
    POST /api/posts/{id}/like/ - Toggle like on a post
    """
    authentication_classes = [CookieAuthentication]

    def post(self, request, id):
        if not request.user:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        post = get_object_or_404(Post, id=id)
        
        like, created = Like.objects.get_or_create(
            member=request.user,
            post=post
        )
        
        if not created:
            like.delete()
            is_liked = False
        else:
            is_liked = True
        
        return Response({
            'is_liked': is_liked,
            'likes_count': post.likes.count()
        }, status=status.HTTP_200_OK)


class CommentListCreateView(APIView):
    """
    GET /api/posts/{post_id}/comments/ - Get all comments for a post
    POST /api/posts/{post_id}/comments/ - Create a comment
    """
    authentication_classes = [CookieAuthentication]

    def get(self, request, post_id):
        if not request.user:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        post = get_object_or_404(Post, id=post_id)
        comments = Comment.objects.filter(post=post).select_related('author')
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, post_id):
        if not request.user:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        post = get_object_or_404(Post, id=post_id)
        serializer = CommentCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            comment = serializer.save(author=request.user, post=post)
            return Response(
                CommentSerializer(comment, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentDeleteView(APIView):
    """
    DELETE /api/comments/{id}/ - Delete a comment (author only)
    """
    authentication_classes = [CookieAuthentication]

    def delete(self, request, id):
        if not request.user:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        comment = get_object_or_404(Comment, id=id)
        
        if comment.author.id != request.user.id:
            return Response(
                {'error': 'You are not authorized to delete this comment'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfileDetailView(APIView):
    """
    GET /api/profile/{id}/ - Get user profile with posts
    """
    authentication_classes = [CookieAuthentication]

    def get(self, request, id):
        if not request.user:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        member = get_object_or_404(Member, id=id)
        serializer = ProfileSerializer(member, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProfileUpdateView(APIView):
    """
    PATCH /api/profile/ - Update own profile
    """
    authentication_classes = [CookieAuthentication]

    def patch(self, request):
        if not request.user:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        serializer = MemberProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                MemberSerializer(request.user).data,
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
