"""Start the MWM Smart HR local demo without installing external packages."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
import threading
import webbrowser

PORT = 8000
ROOT = Path(__file__).resolve().parent

class MWMRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path == "/" or self.path.startswith("/?"):
            self.send_response(302)
            self.send_header("Location", "/login.html")
            self.end_headers()
            return
        super().do_GET()

    def log_message(self, format, *args):
        # Keep the console readable while still reporting HTTP errors.
        if args and str(args[1]).startswith("4"):
            super().log_message(format, *args)


def main():
    os.chdir(ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), MWMRequestHandler)
    print("=" * 54)
    print("MWM Smart HR is running locally")
    print(f"Open: http://127.0.0.1:{PORT}")
    print("Close this window or press Ctrl+C to stop the server.")
    print("Note: this demo stores data in the current browser only.")
    print("=" * 54)
    threading.Timer(0.8, lambda: webbrowser.open(f"http://127.0.0.1:{PORT}/")).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping MWM Smart HR...")
    finally:
        server.server_close()

if __name__ == "__main__":
    main()
