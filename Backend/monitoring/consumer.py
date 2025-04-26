import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer


import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer

class MonitoringConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = None
        await self.accept()
        await self.send_json({'message': 'Connected to monitoring channel'})

    async def receive_json(self, content):
        if content.get('type') == 'authenticate':
            token = content.get('token')
            if token:
                try:
                    self.user = token
                    
                    group_name = 'monitoring_group'
                    await self.channel_layer.group_add(
                        group_name,
                        self.channel_name
                    )
                    await self.send_json({'message': 'Authenticated!'})
                except Exception as e:
                    print("Auth error:", str(e))
                    await self.close()
            else:
                await self.close()
        else:
            if not self.user:
                await self.close()

    async def send_vehicle_location(self, event):
        message = event['message']
        print("Sending vehicle location:", message)
        await self.send(text_data=json.dumps({
            'message': message
        }))

    async def send_bin_color(self, event):
        print("Sending bin color:", event['message'])
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))
