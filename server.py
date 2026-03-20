#!/usr/bin/env python3
"""
CivSim local development server.
Serves static files + proxies LLM API calls (avoids browser CORS blocks).

Usage:
    python3 server.py          # default port 8080
    python3 server.py 3000     # custom port
"""
import http.server
import json
import os
import sys
import urllib.request
import urllib.error

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
DIR = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=DIR, **kw)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def do_POST(self):
        if self.path == '/llm-proxy':
            self._proxy()
        else:
            self.send_error(404)

    def _proxy(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            raw = self.rfile.read(length)
            data = json.loads(raw)

            url = data['url']
            method = data.get('method', 'POST')
            headers = data.get('headers', {})
            body = data.get('body')

            payload = None
            if body is not None:
                payload = json.dumps(body).encode('utf-8') if isinstance(body, (dict, list)) else str(body).encode('utf-8')

            # Cloudflare blocks Python's default User-Agent (error 1010).
            # Set a standard browser UA so API proxying isn't rejected.
            if 'User-Agent' not in headers and 'user-agent' not in headers:
                headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

            req = urllib.request.Request(url, data=payload, headers=headers, method=method)
            # Longer timeout for local models (Ollama can be slow)
            is_local = 'localhost' in url or '127.0.0.1' in url
            req_timeout = 120 if is_local else 30

            with urllib.request.urlopen(req, timeout=req_timeout) as resp:
                resp_body = resp.read()
                self.send_response(resp.status)
                self.send_header('Content-Type', resp.headers.get('Content-Type', 'application/json'))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(resp_body)

        except urllib.error.HTTPError as e:
            resp_body = e.read()
            sys.stderr.write(f'  [LLM-PROXY] HTTP {e.code} from {url}\n')
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(resp_body)

        except Exception as e:
            sys.stderr.write(f'  [LLM-PROXY ERROR] {type(e).__name__}: {e}\n')
            self.send_response(502)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': f'{type(e).__name__}: {e}'}).encode('utf-8'))

    def end_headers(self):
        # Disable caching for development — ensures code changes are always picked up
        path = self.path.split('?')[0]
        if path.endswith(('.js', '.css', '.html', '/')):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, fmt, *args):
        if len(args) > 0 and '/llm-proxy' in str(args[0]):
            sys.stderr.write(f'  [LLM] {args[0]}\n')
        else:
            super().log_message(fmt, *args)


if __name__ == '__main__':
    print(f'CivSim server at http://localhost:{PORT}')
    print('LLM proxy active at /llm-proxy')
    print('Press Ctrl+C to stop.\n')
    with http.server.HTTPServer(('', PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nStopped.')
