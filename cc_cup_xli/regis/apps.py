from django.apps import AppConfig


class RegisConfig(AppConfig):
    name = 'regis'

    def ready(self):
        from . import signals  # noqa: F401 — registers the pre_delete receivers