from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class Member(models.Model):
    """Custom user model for the social network"""
    id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True, max_length=254)
    username = models.CharField(unique=True, max_length=50)
    password = models.CharField(max_length=255)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    bio = models.TextField(blank=True, default='')
    avatar_url = models.URLField(blank=True, null=True, max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'member'
        ordering = ['-created_at']

    def __str__(self):
        return self.username

    @property
    def is_authenticated(self):
        """Always return True for authenticated members"""
        return True

    @property
    def is_anonymous(self):
        """Always return False for members"""
        return False

    def has_perm(self, perm, obj=None):
        """Check if member has a specific permission"""
        return True

    def has_module_perms(self, app_label):
        """Check if member has permissions to view the app"""
        return True

    def set_password(self, raw_password):
        """Hash and set the password"""
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        """Check if the provided password is correct"""
        return check_password(raw_password, self.password)


class Post(models.Model):
    """Model for user posts"""
    id = models.AutoField(primary_key=True)
    author = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'post'
        ordering = ['-created_at']

    def __str__(self):
        return f"Post {self.id} by {self.author.username}"


class Like(models.Model):
    """Model for post likes"""
    id = models.AutoField(primary_key=True)
    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'like'
        unique_together = ['member', 'post']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.member.username} likes Post {self.post.id}"


class Comment(models.Model):
    """Model for post comments"""
    id = models.AutoField(primary_key=True)
    author = models.ForeignKey(
        Member,
        on_delete=models.CASCADE
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'comment'
        ordering = ['created_at']

    def __str__(self):
        return f"Comment {self.id} by {self.author.username} on Post {self.post.id}"
