# from django.test import TestCase
# from django.contrib.auth import get_user_model
# from django.utils import timezone
# from datetime import timedelta
# from .models import Subscription, SubsCategory, Notification

# User = get_user_model()

# class SubscriptionModelTests(TestCase):

#     def setUp(self):
#         self.user = User.objects.create_user(
#             email="testuser@example.com", password="testpass123"
#         )
#         self.category = SubsCategory.objects.create(name="Netflix", user=self.user)

#         self.today = timezone.now().date()
#         self.tomorrow = self.today + timedelta(days=1)
#         self.three_days_later = self.today + timedelta(days=3)
#         self.yesterday = self.today - timedelta(days=1)

#     def create_subscription(self, **kwargs):
#         defaults = {
#             "user": self.user,
#             "sub_Category": self.category,
#             "amount": 100,
#             "start_date": self.today,
#             "due_date": self.three_days_later,
#             "frequency": "weekly",
#             "status": "current",
#             "auto_renew": True,
#             "is_active": True,
#         }
#         defaults.update(kwargs)
#         return Subscription.objects.create(**defaults)

#     def test_subscription_creation(self):
#         sub = self.create_subscription()
#         self.assertEqual(sub.status, "current")
#         self.assertTrue(sub.auto_renew)

#     def test_cancel_subscription_sets_cancel_pending(self):
#         sub = self.create_subscription()
#         sub.cancel_subscription()
#         sub.refresh_from_db()

#         self.assertEqual(sub.status, "cancel_pending")
#         self.assertFalse(sub.auto_renew)
#         self.assertTrue(Notification.objects.filter(user=self.user, message__icontains="requested to cancel").exists())

#     def test_update_status_moves_to_due(self):
#         sub = self.create_subscription(due_date=self.today)
#         sub.update_status()
#         sub.refresh_from_db()

#         self.assertEqual(sub.status, "due")
#         self.assertTrue(Notification.objects.filter(user=self.user, message__icontains="is due today").exists())

#     def test_update_status_creates_warning_notifications(self):
#         sub = self.create_subscription(due_date=self.tomorrow)
#         sub.update_status()
#         self.assertTrue(Notification.objects.filter(user=self.user, message__icontains="is due in 1 days").exists())

#     def test_update_status_renews_subscription(self):
#         sub = self.create_subscription(due_date=self.yesterday, auto_renew=True)
#         old_due_date = sub.due_date
#         sub.update_status()
#         sub.refresh_from_db()

#         self.assertEqual(sub.status, "current")
#         self.assertGreater(sub.due_date, old_due_date)
#         self.assertTrue(Notification.objects.filter(user=self.user, message__icontains="has been renewed").exists())

#     def test_update_status_cancels_subscription_on_due_date_if_auto_renew_off(self):
#         sub = self.create_subscription(due_date=self.yesterday, auto_renew=False)
#         sub.update_status()
#         sub.refresh_from_db()

#         self.assertEqual(sub.status, "cancelled")
#         self.assertFalse(sub.is_active)
#         self.assertTrue(Notification.objects.filter(user=self.user, message__icontains="has been cancelled").exists())

#     def test_cancel_pending_gets_cancelled_after_due_date(self):
#         sub = self.create_subscription(due_date=self.yesterday, status="cancel_pending", auto_renew=False)
#         sub.update_status()
#         sub.refresh_from_db()

#         self.assertEqual(sub.status, "cancelled")
#         self.assertFalse(sub.is_active)
#         self.assertTrue(Notification.objects.filter(user=self.user, message__icontains="has now been cancelled").exists())

#     def test_calculate_next_due_date_monthly(self):
#         sub = self.create_subscription()
#         next_due = sub.calculate_next_due_date()
#         self.assertEqual(next_due.month, (self.today + timedelta(days=7)).month)

# from django.test import TestCase
# from django.contrib.auth import get_user_model
# from django.utils import timezone
# from datetime import timedelta
# from rest_framework.test import APIClient
# from .models import Subscription, SubsCategory, Notification
# from rest_framework_simplejwt.tokens import RefreshToken

# User = get_user_model()

# class SubscriptionTests(TestCase):
#     def setUp(self):
#         self.user = User.objects.create_user(email='test@example.com', password='testpass123')
#         self.category = SubsCategory.objects.create(user=self.user, name="Netflix")
#         self.client = APIClient()
#         self.client.force_authenticate(user=self.user)

#     def create_subscription(self, start_offset=0, due_offset=30, auto_renew=True):
#         start_date = timezone.now().date() + timedelta(days=start_offset)
#         due_date = timezone.now().date() + timedelta(days=due_offset)
#         return Subscription.objects.create(
#             user=self.user,
#             sub_Category=self.category,
#             amount=15.99,
#             start_date=start_date,
#             due_date=due_date,
#             auto_renew=auto_renew
#         )

#     def test_subscription_created_as_current(self):
#         sub = self.create_subscription(start_offset=0)
#         sub.update_status()
#         self.assertEqual(sub.status, "current")

#     def test_subscription_created_as_upcoming(self):
#         sub = self.create_subscription(start_offset=1)
#         sub.update_status()
#         self.assertEqual(sub.status, "upcoming")

#     def test_status_update_to_due(self):
#         sub = self.create_subscription(start_offset=-30, due_offset=0)
#         sub.update_status()
#         self.assertEqual(sub.status, "due")

#     def test_status_update_to_cancelled_after_due(self):
#         sub = self.create_subscription(start_offset=-30, due_offset=-1, auto_renew=False)
#         sub.status = "cancel_pending"
#         sub.save()
#         sub.update_status()
#         sub.refresh_from_db()
#         self.assertEqual(sub.status, "cancelled")
#         self.assertFalse(sub.is_active)

#     def test_renewal_of_subscription(self):
#         sub = self.create_subscription(start_offset=-30, due_offset=-1, auto_renew=True)
#         sub.update_status()
#         sub.refresh_from_db()
#         self.assertEqual(sub.status, "current")
#         self.assertTrue(sub.is_active)

#     def test_cancellation_sets_pending(self):
#         sub = self.create_subscription()
#         sub.cancel_subscription()
#         sub.refresh_from_db()
#         self.assertEqual(sub.status, "cancel_pending")
#         self.assertFalse(sub.auto_renew)

#     def test_reminder_notifications(self):
#         sub = self.create_subscription(start_offset=-27, due_offset=3)
#         Notification.objects.all().delete()
#         sub.update_status()
#         reminders = Notification.objects.filter(user=self.user, notification_type="due_date")
#         self.assertTrue(reminders.exists())

#     def test_due_today_notification(self):
#         sub = self.create_subscription(start_offset=-30, due_offset=0)
#         Notification.objects.all().delete()
#         sub.update_status()
#         msg = Notification.objects.filter(notification_type='subscription_due').first()
#         self.assertIsNotNone(msg)
#         self.assertIn("is due today", msg.message)

#     def test_jwt_login_triggers_status_update(self):
#         sub = self.create_subscription(start_offset=-30, due_offset=0)
#         sub.status = "current"
#         sub.save()

#         refresh = RefreshToken.for_user(self.user)
#         access_token = str(refresh.access_token)

#         response = self.client.post('/api/token/', {
#             "email": self.user.email,
#             "password": "testpass123"
#         })

#         self.assertEqual(response.status_code, 200)

#         # Refresh from DB after login (which triggers update)
#         sub.refresh_from_db()
#         self.assertEqual(sub.status, "due")

# from django.test import TestCase
# from django.contrib.auth import get_user_model
# from django.utils import timezone
# from datetime import timedelta, date
# from financeApp.models import Budget, Expense, ExpenseCategory, Notification
# from django.utils.timezone import make_aware, datetime

# User = get_user_model()

# class BudgetModelTest(TestCase):
#     def test_budget_period_ends_on_due_date(self):
#         user = User.objects.create_user(email="john@gmail.com", password="testpass")
#         category = ExpenseCategory.objects.create(user=user, name="Transport")
#         start_date = date.today() - timedelta(days=3)
#         due_date = date.today()  # today

#         budget = Budget.objects.create(user=user, expense_category=category, amount_to_budget=300, start_date=start_date, due_date=due_date)

#         Expense.objects.create(
#             user=user,
#             expense_category=category,
#             amount_used=250,
#             created_at=make_aware(datetime.combine(start_date + timedelta(days=1), datetime.min.time()))
#         )

#         Notification.objects.all().delete()
#         budget.update_status()

#         assert budget.status == 'period_ended'
#         assert Notification.objects.filter(message__icontains="has ended today").exists()

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from .models import SavingsGoal, SavingsContribution, Income, IncomeCategory

User = get_user_model()

class SavingsGoalTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(email='testuser@gmail.com', password='password')
        self.salary = IncomeCategory.objects.create(name='Salary', user=self.user)
        self.freelance = IncomeCategory.objects.create(name='Freelance', user=self.user)

        self.goal = SavingsGoal.objects.create(
            user=self.user,
            title='Vacation',
            target_amount=Decimal('1000.00'),
            percentage_per_income=Decimal('10.00'),  # 10%
            saved_amount=Decimal('0.00'),
        )
        self.goal.income_categories.set([self.salary, self.freelance])

    def test_can_select_multiple_income_categories(self):
        """User can select one or more income categories for a goal"""
        self.assertEqual(self.goal.income_categories.count(), 2)
        self.assertIn(self.salary, self.goal.income_categories.all())
        self.assertIn(self.freelance, self.goal.income_categories.all())

    def test_income_after_goal_creation_affects_savings(self):
        """Only incomes created after the goal are considered for allocation"""
        # Income BEFORE goal creation - should not be counted
        Income.objects.create(
            user=self.user,
            income_category=self.salary,
            amount_received=Decimal('1000.00'),
            created_at=self.goal.created_at - timedelta(days=1)
        )

        # Income AFTER goal creation - should be counted
        Income.objects.create(
            user=self.user,
            income_category=self.salary,
            amount_received=Decimal('1000.00'),
            created_at=self.goal.created_at + timedelta(days=1)
        )

        self.goal.refresh_from_db()
        self.assertEqual(self.goal.saved_amount, Decimal('100.00'))  # 10% of 1000
        self.assertNotEqual(self.goal.saved_amount, Decimal('200.00'))  # Make sure old income didn't affect

    def test_correct_percentage_is_saved_from_income(self):
        """Verify if 10% of income is saved to the goal"""
        Income.objects.create(
            user=self.user,
            income_category=self.salary,  # Was self.category, fixed to self.salary
            amount_received=Decimal('500.00'),
            created_at=timezone.now()
        )
        self.goal.refresh_from_db()
        expected_saved = Decimal('50.00')  # 10% of 500
        self.assertEqual(self.goal.saved_amount, expected_saved)

    def test_estimated_completion_date_accuracy(self):
        """Test estimated completion date is calculated correctly"""
        # Create 3 income entries in the selected category
        for _ in range(3):
            Income.objects.create(
                user=self.user,
                income_category=self.salary,
                amount_received=Decimal('600.00'),
                created_at=timezone.now()
            )

        self.goal.refresh_from_db()
        estimated = self.goal.calculate_estimated_completion()
        self.assertIsNotNone(estimated)
        self.assertTrue(estimated > timezone.now().date())

    def test_manual_top_up_adds_to_savings(self):
        """User can manually top up a savings goal"""
        self.goal.add_manual_top_up(Decimal('300.00'))
        self.goal.refresh_from_db()
        self.assertEqual(self.goal.saved_amount, Decimal('300.00'))

        # Confirm it created a SavingsContribution
        self.assertEqual(self.goal.manual_contributions.count(), 1)

    def test_status_changes_correctly(self):
        """Test status changes: in_progress -> completed and not from completed -> cancelled"""
        # Top-up goal to meet the target
        self.goal.add_manual_top_up(Decimal('1000.00'))
        self.goal.refresh_from_db()
        self.assertEqual(self.goal.status, 'completed')

        # Try changing status to cancelled after completion
        self.goal.status = 'cancelled'
        self.goal.save()
        self.goal.refresh_from_db()
        self.assertNotEqual(self.goal.status, 'cancelled')  # Assuming logic prevents change
