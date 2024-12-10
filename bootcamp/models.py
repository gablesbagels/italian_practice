from django.db import models
from django.db.models import Q

class ItalianVerb(models.Model):
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['verb'],
                name='unique_verb'
            )
        ]
    verb = models.CharField(max_length=20)
    is_reflexive = models.BooleanField(default=False)
    is_reciprocal = models.BooleanField(default=False)
    is_irregular = models.BooleanField(default=False)
    
    def __str__(self):
        return self.verb.title()
    
class PlayerScores(models.Model):
    initials = models.CharField(max_length=3)
    score = models.IntegerField(default=0)
    created_date = models.DateTimeField(auto_now_add=True)
    rank_at_created = models.IntegerField(default=0)
    
    class Meta:
        indexes = [
            models.Index(fields=['-score']),  # Index for descending order on 'score'
        ]

    def __str__(self):
        return f"{self.initials.title()} - {self.score}"
