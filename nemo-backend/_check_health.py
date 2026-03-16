import urllib.request
req = urllib.request.Request('http://127.0.0.1:8000/health')
print(urllib.request.urlopen(req).read())
