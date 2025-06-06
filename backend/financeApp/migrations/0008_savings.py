# Generated by Django 5.1.7 on 2025-04-17 08:52

import cloudinary.models
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('financeApp', '0007_remove_subscription_name_subscategory_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Savings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('percentage_allocated', models.DecimalField(decimal_places=2, help_text='Percentage of income to allocate to savings', max_digits=5)),
                ('amount_saved', models.DecimalField(blank=True, decimal_places=2, max_digits=10)),
                ('item_image', cloudinary.models.CloudinaryField(max_length=255, verbose_name='image')),
                ('status', models.CharField(choices=[('in_progress', 'In Progress'), ('cancelled', 'Cancelled'), ('period_ended', 'Period Ended')], default='in_progress', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('income', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='savings_allocations', to='financeApp.income')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='Savings', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
