from channels import route
from channels.staticfiles import StaticFilesConsumer
 
channel_routing = [
  route('http.request', StaticFilesConsumer()),
]
