from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Profile, Expense, Budget
from django.db.models.signals import post_delete

User = get_user_model()

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        # Create a profile if user is newly created
        Profile.objects.create(user=instance)
    else:
        # Save profile if user is updated
        if hasattr(instance, 'profile'):
            instance.profile.save()

@receiver(post_save, sender=Expense)
def update_budget_status(sender, instance, **kwargs):
    expense_date = instance.created_at.date()

    budgets = Budget.objects.filter(
        user=instance.user,
        expense_category=instance.expense_category,
        start_date__lte=expense_date,
        due_date__gte=expense_date
    )

    for budget in budgets:
        budget.update_status()

@receiver(post_delete, sender=Expense)
def update_budget_status_on_delete(sender, instance, **kwargs):
    expense_date = instance.created_at.date()

    budgets = Budget.objects.filter(
        user=instance.user,
        expense_category=instance.expense_category,
        start_date__lte=expense_date,
        due_date__gte=expense_date
    )

    for budget in budgets:
        budget.update_status()