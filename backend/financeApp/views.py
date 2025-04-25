from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from .serializers import *
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from financeApp.signals import update_budget_status, update_budget_status_on_delete
from rest_framework.views import APIView
from decimal import Decimal

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class ProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.profile

class myTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    model = User
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def put(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            serializer.update(user, serializer.validated_data)
            return Response({"message": "Password updated successfully."}, status=200)
        return Response(serializer.errors, status=400)

class DeleteAccountView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()

    def get_object(self):
        return self.request.user

    def delete(self, request, *args, **kwargs):
        user = request.user

        # Delete related objects manually
        user.notifications.all().delete()
        user.incomes.all().delete()
        user.expenses.all().delete()
        user.budget_set.all().delete()
        user.subscription_set.all().delete()
        user.income_categories.all().delete()
        user.expense_categories.all().delete()
        user.subs.all().delete()
        if hasattr(user, 'profile'):
            user.profile.delete()

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BudgetView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Budget.objects.filter(user=self.request.user)
        for budget in qs:
            budget.update_status()
        return qs
    
    def perform_create(self, serializer):
        serializer.save()

class ModifyBudget(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)
    
    def get_object(self):
        obj = super().get_object()
        obj.update_status()
        return obj
    
class IncomeView(generics.ListCreateAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user) 
    
    def perform_create(self, serializer):
        serializer.save()

class IncomeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

class IncomeCategoryView(generics.ListAPIView):
    serializer_class = IncomeCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return IncomeCategory.objects.filter(user=self.request.user)
    
class IncomeCategoryViewDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = IncomeCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return IncomeCategory.objects.filter(user=self.request.user)
    
class ExpenseView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user) 
    
    def perform_create(self, serializer):
        instance = serializer.save()
        update_budget_status(sender=Expense, instance=instance)

class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)
    
    def perform_update(self, serializer):
        instance = serializer.save()
        update_budget_status(sender=Expense, instance=instance)

    def perform_destroy(self, instance):
        update_budget_status_on_delete(sender=Expense, instance=instance)
        instance.delete()


class ExpenseCategoryView(generics.ListAPIView):
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExpenseCategory.objects.filter(user=self.request.user)
    
class ExpenseCategoryDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExpenseCategory.objects.filter(user=self.request.user)

class SubscriptionsView(generics.ListCreateAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user) 
    
    def perform_create(self, serializer):
        serializer.save() 
        
class SubscritpionsDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        subscriptions = Subscription.objects.filter(user=self.request.user) 
        for sub in subscriptions:
            sub.update_status()
        return subscriptions

class SubscriptionCategoryView(generics.ListCreateAPIView):
    serializer_class = SubscriptionCategories
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SubsCategory.objects.filter(user = self.request.user)

class SubscriptionCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SubscriptionCategories
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SubsCategory.objects.filter(user=self.request.user)

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

class ClearAllNotificationsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        user = request.user
        Notification.objects.filter(user=user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class MarkNotificationReadView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        serializer.instance.is_read = True
        serializer.save()

class MarkAllNotificationsReadView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user, is_read=False)

    def update(self, request, *args, **kwargs):
        notifications = self.get_queryset()
        notifications.update(is_read=True)
        return Response({"message": "All notifications marked as read!"}, status=200)

@api_view(['POST'])
def cancel_subscription(request, pk):
    try:
        subscription = Subscription.objects.get(id=pk, user=request.user)
        subscription.cancel_subscription()
        return Response({"message": f"Subscription '{subscription.sub_Category}' is now set to cancel after {subscription.due_date}."})
    except Subscription.DoesNotExist:
        return Response({"error": "Subscription not found."}, status=404)
    
@api_view(['POST'])
def cancel_Immediately(request, pk):
    try:
        subscription = Subscription.objects.get(id=pk, user=request.user)
        subscription.cancel_immediately()
        return Response({"message": f"Subscription '{subscription.sub_Category}' has been cancelled effective immediately"})
    except Subscription.DoesNotExist:
        return Response({"error": "Subscription not found."}, status=404)

@api_view(['POST'])
def Renew_sub(request, pk):
    try:
        subscription = Subscription.objects.get(id=pk, user=request.user)
        subscription.renew_Subscription()
        return Response({"message": f"Subscription '{subscription.sub_Category}' has been renewed"})
    except Subscription.DoesNotExist:
        return Response({"error": "Subscription not found."}, status=404)
