from django.urls import path, include
from django.views.i18n import JavaScriptCatalog
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path("", views.UnderConstruction.as_view(), name="home"),
    path('under_construction', views.UnderConstruction.as_view(), name='under_construction'),
    path('send_email_italian', views.send_email_italian_comment, name='send_email_italian'),
    path('italian_conjugation', views.italian_conjugation, name='italian_conjugation'),
    path('api/save_score/', views.save_score, name='api/save_score'),
    path('api/top_ten_scores/', views.top_ten_scores, name='api/top_ten_scores'),
    path('api/get_italian_conjugation/', views.get_italian_conjugation, name='api/get_italian_conjugation')
]
