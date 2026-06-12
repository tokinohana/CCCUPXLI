from rest_framework import serializers
from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    """Full ticket serializer for list/detail responses."""
    scanned_by = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            'ticket_id', 'full_name', 'email', 'identification_number',
            'status', 'is_redeemed', 'redeemed_at', 'terminal',
            'scanned_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['ticket_id', 'is_redeemed', 'redeemed_at', 'terminal', 'created_at', 'updated_at']

    def get_scanned_by(self, obj):
        if obj.scanned_by:
            return obj.scanned_by.email
        return None


class CreateTicketSerializer(serializers.ModelSerializer):
    """Serializer for creating a new ticket (sales form)."""

    class Meta:
        model = Ticket
        fields = ['full_name', 'email', 'identification_number']

    def validate_identification_number(self, value):
        if Ticket.objects.filter(identification_number=value).exists():
            raise serializers.ValidationError("A ticket with this identification number already exists.")
        return value


class UpdateTicketSerializer(serializers.ModelSerializer):
    """Serializer for updating ticket status (mark as paid / void)."""

    class Meta:
        model = Ticket
        fields = ['status']

    def validate_status(self, value):
        instance = self.instance
        # Prevent re-activating voided tickets
        if instance and instance.status == 'voided' and value != 'voided':
            raise serializers.ValidationError("Voided tickets cannot be reactivated.")
        # Prevent changing paid back to pending
        if instance and instance.status == 'paid' and value == 'pending':
            raise serializers.ValidationError("Paid tickets cannot be set back to pending.")
        return value


class RedeemTicketSerializer(serializers.Serializer):
    """Serializer for the redeem (scan) endpoint."""
    terminal = serializers.CharField(max_length=50, required=True)
