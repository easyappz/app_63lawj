from rest_framework import serializers
from api.models import Member, Post, Comment, Like


class MemberSerializer(serializers.ModelSerializer):
    """Serializer for displaying member information"""
    class Meta:
        model = Member
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'bio', 'avatar_url', 'created_at']
        read_only_fields = ['id', 'created_at']


class MemberRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for member registration"""
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Member
        fields = ['email', 'username', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        """Create a new member with hashed password"""
        password = validated_data.pop('password')
        member = Member(**validated_data)
        member.set_password(password)
        member.save()
        return member


class MemberLoginSerializer(serializers.Serializer):
    """Serializer for member login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class MemberProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating member profile"""
    class Meta:
        model = Member
        fields = ['first_name', 'last_name', 'bio', 'avatar_url']


class PostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a post"""
    class Meta:
        model = Post
        fields = ['content']


class PostSerializer(serializers.ModelSerializer):
    """Serializer for displaying post information"""
    author = MemberSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'created_at', 'updated_at', 'likes_count', 'comments_count', 'is_liked']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_likes_count(self, obj):
        """Get the number of likes for the post"""
        return obj.likes.count()

    def get_comments_count(self, obj):
        """Get the number of comments for the post"""
        return obj.comments.count()

    def get_is_liked(self, obj):
        """Check if the current user has liked the post"""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user:
            return Like.objects.filter(post=obj, member=request.user).exists()
        return False


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a comment"""
    class Meta:
        model = Comment
        fields = ['content']


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for displaying comment information"""
    author = MemberSerializer(read_only=True)
    post_id = serializers.IntegerField(source='post.id', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'post_id', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with posts"""
    posts = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'bio', 'avatar_url', 'created_at', 'posts']
        read_only_fields = ['id', 'created_at']

    def get_posts(self, obj):
        """Get all posts by the user"""
        posts = obj.posts.all()
        return PostSerializer(posts, many=True, context=self.context).data
