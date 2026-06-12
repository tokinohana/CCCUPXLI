"""
Data migration: Create RBAC groups for admin access control.

Groups created:
  - "Registration Committee": full CRUD on all regis app models
  - "Ticketing Committee": full CRUD on all ticketing app models
"""
from django.db import migrations
from django.contrib.auth.management import create_permissions


def create_rbac_groups(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Permission = apps.get_model('auth', 'Permission')
    ContentType = apps.get_model('contenttypes', 'ContentType')

    # Ensure permissions are created for all apps before we reference them
    for app_config in apps.get_app_configs():
        app_config.models_module = True
        create_permissions(app_config, apps=apps, verbosity=0)
        app_config.models_module = None

    # ── Registration Committee ──────────────────────────────────────────────
    regis_group, _ = Group.objects.get_or_create(name='Registration Committee')
    regis_cts = ContentType.objects.filter(app_label='regis')
    regis_perms = Permission.objects.filter(content_type__in=regis_cts)
    regis_group.permissions.set(regis_perms)

    # ── Ticketing Committee ─────────────────────────────────────────────────
    ticketing_group, _ = Group.objects.get_or_create(name='Ticketing Committee')
    ticketing_cts = ContentType.objects.filter(app_label='ticketing')
    ticketing_perms = Permission.objects.filter(content_type__in=ticketing_cts)
    ticketing_group.permissions.set(ticketing_perms)


def remove_rbac_groups(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Group.objects.filter(name__in=['Registration Committee', 'Ticketing Committee']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0005_alter_user_division_name'),
        ('regis', '0002_alter_member_options_alter_memberfile_options_and_more'),
        ('ticketing', '0002_initial'),
    ]

    operations = [
        migrations.RunPython(create_rbac_groups, remove_rbac_groups),
    ]
