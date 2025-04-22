# notification/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken

from asgiref.sync import sync_to_async
from user.models import CustomUser

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.user = None  # Not authenticated yet

    async def receive(self, text_data):
        data = json.loads(text_data)
        # print("Received data:", data)
        if data.get('type') == 'authenticate':
            token = data.get('token')
            if token:
                try:
                    access_token_obj = AccessToken(token)
                    user_id = access_token_obj['user_id']
                    user = await sync_to_async(CustomUser.objects.get)(id=user_id)
                    self.user = user

                    # Join dynamic group after authentication
                    if user.user_type == 'admin':
                        group_name = "admin_notifications"
                    else:
                        group_name = f"user_{user.id}_notifications"
                    print("Joining group:", group_name)
                    await self.channel_layer.group_add(
                        group_name,
                        self.channel_name
                    )
                    await self.send(json.dumps({'message': 'Authenticated!'}))

                except Exception as e:
                    print("Auth error:", str(e))
                    await self.close()

            else:
                await self.close()

        else:
            if not self.user:
                # Not authenticated users cannot send other messages
                await self.close()
                
    async def send_notification(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))
