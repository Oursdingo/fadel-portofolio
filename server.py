"""Tiny threaded static dev server that disables caching, so edits always show on reload."""
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5501


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, *args):
        pass  # quiet


ThreadingHTTPServer.allow_reuse_address = True

with ThreadingHTTPServer(("", PORT), NoCacheHandler) as httpd:
    print(f"Serving {PORT} with no-cache headers (threaded)")
    httpd.serve_forever()
