from django.db import models
from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from .managers import CustomUserManager
from django.conf import settings
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from django.db.models import Sum
from django.db.models.functions import TruncDate
# Create your models here.

class CustomUser(AbstractUser):
    username = None 
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

class Profile(models.Model):  
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    username = models.CharField(max_length=20, default='John Doe')
    image = CloudinaryField("image", default='https://res.cloudinary.com/devs9of9t/default_cl3qsg.jpg')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.email
    
class IncomeCategory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='income_categories')
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name

class Income(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='incomes')
    income_category = models.ForeignKey(IncomeCategory, on_delete=models.PROTECT,related_name="incomes_category")
    amount_received = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.income_category.name} - {self.amount_received}"

class ExpenseCategory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="expense_categories")
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
class Expense(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses') 
    amount_used = models.DecimalField(max_digits=10, decimal_places=2)
    expense_category = models.ForeignKey(ExpenseCategory, on_delete=models.PROTECT, related_name="expenses_category")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.expense_category.name} - {self.amount_used}"

class Budget(models.Model):
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('overspent', 'Overspent'),
        ('period_ended', 'Period Ended'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    expense_category = models.ForeignKey(ExpenseCategory, on_delete=models.PROTECT, related_name="budgets")
    amount_to_budget = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField() 
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')

    
    def update_status(self):
        today = date.today()
        time_remaining = (self.due_date - today).days

        total_spent = self.expense_category.expenses_category.annotate(
            created_date=TruncDate('created_at')
        ).filter(
            user=self.user,
            created_date__gte=self.start_date,
            created_date__lte=self.due_date
        ).aggregate(total=Sum('amount_used'))['total'] or 0

        if time_remaining == 1:
            Notification.objects.get_or_create(
                user=self.user,
                message=f"Your budget for '{self.expense_category}' is ending tomorrow",
                notification_type='general'
            )

        if today >= self.due_date:
            self.status = 'period_ended'
            Notification.objects.get_or_create(
                user=self.user,
                message=f"Your budget for '{self.expense_category}' has ended today",
                notification_type='general'
            )

        elif total_spent > self.amount_to_budget:
            self.status = 'overspent'
            Notification.objects.get_or_create(
                user=self.user,
                message=f"You have exceeded your budget limit for '{self.expense_category}'!",
                notification_type='general'
            )

        else:
            self.status = 'in_progress'

        self.save()


class SubsCategory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subs")
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
class Subscription(models.Model):
    STATUS_CHOICES = [
        ('current', 'Current'),
        ('upcoming', 'Upcoming'),
        ('due', 'Due'),
        ('cancelled', 'Cancelled'),
        ('cancel_pending', 'Cancel Pending'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    sub_Category = models.ForeignKey(SubsCategory, on_delete=models.PROTECT, related_name="subs")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField()
    due_date = models.DateField()
    frequency = models.CharField(max_length=20, default='monthly')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='current')
    auto_renew = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.sub_Category.name} - {self.status}"


    def cancel_subscription(self):
        """
        Allows the user to cancel before the due date but keeps tracking until the due date.
        """
        if self.status in ["current", "upcoming"]:
            self.status = "cancel_pending" 
            self.auto_renew = False 
            Notification.objects.create(
                user=self.user,
                message=f"You have requested to cancel your '{self.sub_Category}' subscription. It will remain active until {self.due_date.strftime('%Y-%m-%d')}.",
                notification_type='general'
            )
            self.save()
    
    def cancel_immediately(self):
        self.status = "cancelled"
        self.auto_renew = False
        self.is_active = False

        Notification.objects.create(
            user=self.user,
            message=f"Your '{self.sub_Category}' subscription has been cancelled immediately.",
            notification_type='due_date'
        )
        self.save()
    
    def renew_Subscription(self):
        self.status = 'upcoming'
        self.auto_renew = True
        self.is_active = True

        Notification.objects.create(
            user=self.user,
            message=f"Your '{self.sub_Category}' subscription has been renewed.",
            notification_type='general'
        )
        self.save()


    def update_status(self):
        """
        Updates the status of the subscription based on the current date.
        """
        today = date.today()
        days_remaining = (self.due_date - today).days

        if self.start_date > today:
            self.status = "upcoming"
            self.save()
            return

        if self.status == "cancel_pending" and today >= self.due_date:
            self.status = "cancelled"
            self.is_active = False
            Notification.objects.create(
                user=self.user,
                message=f"Your subscription '{self.sub_Category}' has now been cancelled as per your request.",
                notification_type='general'
            )

        elif self.status not in ["cancel_pending", "cancelled"]:
            if days_remaining in [3, 2, 1]:
                Notification.objects.create(
                    user=self.user,
                    message=f"Your '{self.sub_Category}' subscription is due in {days_remaining} days!",
                    notification_type='due_date'
                )
            
            if today >= self.start_date and today < self.due_date:
                self.status = 'current'
                self.save()
                return

            if today == self.due_date:
                self.status = "due"
                Notification.objects.create(
                    user=self.user,
                    message=f"Your '{self.sub_Category}' subscription is due today!",
                    notification_type='subscription_due'
                )

            elif today > self.due_date:
                if self.auto_renew:
                    self.start_date = self.due_date + timedelta(days=1)
                    self.due_date = self.calculate_next_due_date()
                    self.status = "current"
                    self.is_active = True
                    Notification.objects.create(
                        user=self.user,
                        message=f"Your '{self.sub_Category}' subscription has been renewed as per your settings.",
                        notification_type='general'
                    )
                else:
                    self.status = "cancelled"
                    self.is_active = False
                    Notification.objects.create(
                        user=self.user,
                        message=f"Your '{self.sub_Category}' subscription has been cancelled.",
                        notification_type='general'
                    )

        self.save()

    def calculate_next_due_date(self):
        """Calculates the next due date based on frequency."""
        if self.frequency == "monthly":
            return self.due_date + relativedelta(months=1)
        elif self.frequency == "yearly":
            return self.due_date + relativedelta(years=1)
        elif self.frequency == "weekly":
            return self.due_date + timedelta(weeks=1)
        return self.due_date

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('due_date', 'Due'),
        ('general', 'General'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='general')
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.email} - {self.notification_type}"