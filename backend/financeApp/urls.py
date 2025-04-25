from django.urls import path
from .views import *
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import myTokenObtainPairView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("profile/", ProfileDetailView.as_view(), name="profile"),
    path('token/', myTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),

    path("budget/", BudgetView.as_view(), name="create-list-budget"),
    path("budget/<int:pk>/", ModifyBudget.as_view(), name='modify-budget'),
    
    path("income/", IncomeView.as_view(), name="create-list-income"),
    path("income/<int:pk>/", IncomeDetailView.as_view(), name="modify-income"),
    path("income-categories/", IncomeCategoryView.as_view(), name="list-income-categories"),
    path("income-categories/<int:pk>/", IncomeCategoryViewDetailView.as_view(), name="list-income-categories"),

    path("expense/", ExpenseView.as_view(), name="create-list-expense"),
    path("expense/<int:pk>/", ExpenseDetailView.as_view(), name="modify-expense"),
    path("expense-categories/", ExpenseCategoryView.as_view(), name="list-expense-categories"),
    path("expense-categories/<int:pk>/", ExpenseCategoryDetailView.as_view(), name="modify-expense-categories"),

    path('subscriptions/', SubscriptionsView.as_view(), name='create-list-subscriptions'),
    path('subscriptions/<int:pk>/', SubscritpionsDetailView.as_view(), name='modify-subscriptions'),

    path('cancel-subscription/<int:pk>/', cancel_subscription, name='cancel_subscription'),
    path('cancel-immediately/<int:pk>/', cancel_Immediately, name='cancel'),
    path('renew-subs/<int:pk>/', Renew_sub, name='Renew'),

    path('sub-category/', SubscriptionCategoryView.as_view(), name='Subscription-categories'),
    path('sub-category/<int:pk>/', SubscriptionCategoryDetailView.as_view(), name='modify-Subscription-categories'),

    path("notifications/", NotificationListView.as_view(), name="notification-list"),
    path("notifications/<int:pk>/mark-read/", MarkNotificationReadView.as_view(), name="mark-notification-read"),
    path("notifications/mark-all-read/", MarkAllNotificationsReadView.as_view(), name="mark-all-notifications-read"),
    path("notifications/delete-all/", ClearAllNotificationsView.as_view(), name="clear-all-notifications"),

    path('delete-account/', DeleteAccountView.as_view(), name='delete-account'),
]
