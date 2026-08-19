from django.db.models.signals import pre_delete
from django.dispatch import receiver

from .models import TeamFile, MemberFile
from .cloudinary_utils import destroy_asset


@receiver(pre_delete, sender=TeamFile)
def delete_team_file_from_cloudinary(sender, instance, **kwargs):
    destroy_asset(instance.public_id)


@receiver(pre_delete, sender=MemberFile)
def delete_member_file_from_cloudinary(sender, instance, **kwargs):
    destroy_asset(instance.public_id)