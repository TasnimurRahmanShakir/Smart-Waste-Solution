from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_notification_to_admin(message, created_at):
    print("Sending notification to admin:", message)
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "admin_notifications",
        {
            "type": "send_notification",
            "message": message,
            'created_at': created_at.isoformat()
        }
    )

def send_notification_to_user(user_id, message, created_at):
    
    print("Sending notification to user:", user_id, "Message:", message)
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{user_id}_notifications", 
        {
            "type": "send_notification",
            "message": message,
            'created_at': created_at.isoformat()
        }
    )
    

    
