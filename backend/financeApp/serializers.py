from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed, NotFound
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = [ "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        # Check if user exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise NotFound("User not found. Please register first.")

        # Authenticate user
        user = authenticate(email=email, password=password)
        if not user:
            raise AuthenticationFailed("Invalid email or password.")
        
        subscriptions = Subscription.objects.filter(user=user)
        for sub in subscriptions:
            sub.update_status()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return {
            "refresh": str(refresh),
            "access": access_token,
        }

class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email")

    class Meta:
        model = Profile
        fields = ["id", "created_at", "updated_at", "image", "username", "email"]
        read_only_fields = ["id", "created_at", "updated_at"]
    
    def validate_email(self, value):
        user = self.instance.user
        if User.objects.exclude(id=user.id).filter(email=value).exists():
            raise serializers.ValidationError("Use another email.")
        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        user = instance.user

        if "email" in user_data:
            user.email = user_data["email"]

        user.save()
        return super().update(instance, validated_data)

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def update(self, instance, validated_data):
        instance.set_password(validated_data["new_password"])
        instance.save()
        return instance


class IncomeSerializer(serializers.ModelSerializer):
    income_category = serializers.CharField()
    class Meta:
        model = Income
        fields = ["id", "income_category", "amount_received", "created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        category_data = validated_data.pop("income_category")

        # Handle Income Category (Existing or New)
        if category_data.isdigit():  # If it's an ID, use existing category
            category = IncomeCategory.objects.get(id=category_data)
        else:  # If it's a name, create a new category
            category, _ = IncomeCategory.objects.get_or_create(name=category_data, user=request.user)

        # Create the income entry
        return Income.objects.create(
            user=request.user,
            income_category=category,
            **validated_data
        )

    def update(self, instance, validated_data):
        request = self.context.get("request")

        # Handle Income Category (Existing or New)
        category_data = validated_data.pop("income_category", None)
        if category_data:
            if category_data.isdigit():
                category = IncomeCategory.objects.get(id=category_data)
            else:
                category, _ = IncomeCategory.objects.get_or_create(name=category_data, user=request.user)
            instance.income_category = category

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
    
class ExpenseBudgetSerilazer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'amount_used','expense_category','created_at','updated_at']


class BudgetSerializer(serializers.ModelSerializer):
    expense_category = serializers.CharField()
    related_expenses = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = ["id", "expense_category", "amount_to_budget", "due_date", "status","start_date","related_expenses"]
        read_only_fields = ["id", "user", "status"]
    
    def get_related_expenses(self, obj):
        expenses = Expense.objects.filter(
            user=obj.user,
            expense_category=obj.expense_category,
            created_at__gte=obj.start_date,
            created_at__lte=obj.due_date
        )
        return ExpenseBudgetSerilazer(expenses, many=True).data

    def create(self, validated_data):
        request = self.context.get("request")
        category_data = validated_data.pop("expense_category")

        # Handle Expense Category (Existing or New)
        if category_data.isdigit():  # If it's an ID, use existing category
            category = ExpenseCategory.objects.get(id=category_data)
        else:  # If it's a name, create a new category
            category, _ = ExpenseCategory.objects.get_or_create(name=category_data, user=request.user)

        # Create the budget entry
        return Budget.objects.create(
            user=request.user,
            expense_category=category,
            **validated_data
        )

    def update(self, instance, validated_data):
        request = self.context.get("request")

        # Handle Expense Category (Existing or New)
        category_data = validated_data.pop("expense_category", None)
        if category_data:
            if category_data.isdigit():
                category = ExpenseCategory.objects.get(id=category_data)
            else:
                category, _ = ExpenseCategory.objects.get_or_create(name=category_data, user=request.user)
            instance.expense_category = category

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
    
class ExpenseSerializer(serializers.ModelSerializer):
    expense_category = serializers.CharField()
    class Meta:
        model = Expense
        fields = ['id', 'expense_category', 'amount_used', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        request = self.context.get("request")
        category_data = validated_data.pop("expense_category")

        if category_data.isdigit():
            category = ExpenseCategory.objects.get(id=category_data)
        else:
            category, _ = ExpenseCategory.objects.get_or_create(name=category_data, user=request.user)

        return Expense.objects.create(
            user=request.user,
            expense_category=category,
            **validated_data
        )
    
    def update(self, instance, validated_data):
        request = self.context.get("request")

        # Handle Expense Category (Existing or New)
        category_data = validated_data.pop("expense_category", None)
        if category_data:
            if category_data.isdigit():
                category = ExpenseCategory.objects.get(id=category_data)
            else:
                category, _ = ExpenseCategory.objects.get_or_create(name=category_data, user=request.user)
            instance.expense_category = category

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

class SubscriptionSerializer(serializers.ModelSerializer):
    sub_Category = serializers.CharField()
    class Meta:
        model = Subscription
        fields = '__all__'
        read_only_fields = ["id","user","status"]
    
    def create(self, validated_data):
        request = self.context.get("request")
        category_data = validated_data.pop("sub_Category")

        if category_data.isdigit():
            category = SubsCategory.objects.get(id=category_data)
        else:
            category, _ = SubsCategory.objects.get_or_create(name=category_data, user=request.user)


        subscription = Subscription.objects.create(
            user=request.user,
            sub_Category=category,
            **validated_data
        )
        subscription.update_status()
        return subscription
    
    def update(self, instance, validated_data):
        request = self.context.get("request")

        # Handle Income Category (Existing or New)
        category_data = validated_data.pop("sub_Category", None)
        if category_data:
            if category_data.isdigit():
                category = SubsCategory.objects.get(id=category_data)
            else:
                category, _ = SubsCategory.objects.get_or_create(name=category_data, user=request.user)
            instance.sub_Category = category

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        instance.update_status()
        return instance

class SubscriptionCategories(serializers.ModelSerializer):
    class Meta:
        model = SubsCategory
        fields = '__all__'

class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'notification_type', 'created_at', 'is_read']
        read_only_fields = ['id', 'user', 'created_at']

class IncomeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeCategory
        fields = '__all__'