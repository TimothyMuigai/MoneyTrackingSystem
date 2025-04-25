from django.contrib import admin
from .models import *
# Register your models here.

admin.site.register(CustomUser)
admin.site.register(Profile)
admin.site.register(Subscription)
admin.site.register(SubsCategory)
admin.site.register(Income)
admin.site.register(IncomeCategory)
admin.site.register(Expense)
admin.site.register(ExpenseCategory)
admin.site.register(Budget)
admin.site.register(Notification)