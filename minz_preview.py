"""Local-only preview. No external dependencies. Run beside the portfolio assets."""
import os
import re
import shutil
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parent
PAGE = 'minz-directors-v7-focus.html'

class Preview(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def list_directory(self, path):
        self.send_error(403, 'Directory listing disabled')
        return None

    def send_head(self):
        parts = unquote(urlsplit(self.path).path).replace('\\','/').split('/')
        target = Path(self.translate_path(self.path)).resolve()
        if any(x.startswith('.') for x in parts if x) or ROOT not in (target, *target.parents):
            self.send_error(403)
            return None
        self._range = None
        header = self.headers.get('Range')
        if not header or not target.is_file():
            return super().send_head()
        match = re.fullmatch(r'bytes=(\d*)-(\d*)', header.strip())
        if not match:
            return super().send_head()
        f = target.open('rb')
        st = os.fstat(f.fileno()); size = st.st_size
        lo, hi = match.groups()
        if lo:
            start = int(lo); end = min(int(hi), size-1) if hi else size-1
        elif hi:
            start = max(0,size-int(hi)); end = size-1
        else:
            start = 0; end = -1
        if start > end or start >= size:
            f.close(); self.send_response(416); self.send_header('Content-Range',f'bytes */{size}'); self.end_headers(); return None
        self._range = (start,end)
        self.send_response(206)
        self.send_header('Content-type',self.guess_type(str(target)))
        self.send_header('Accept-Ranges','bytes')
        self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length',str(end-start+1))
        self.send_header('Last-Modified',self.date_time_string(st.st_mtime))
        self.end_headers(); return f

    def copyfile(self, source, outputfile):
        if self._range is None:
            return shutil.copyfileobj(source,outputfile)
        start,end = self._range; source.seek(start); left=end-start+1
        while left:
            chunk=source.read(min(left,65536))
            if not chunk: break
            outputfile.write(chunk); left-=len(chunk)

if __name__ == '__main__':
    if not (ROOT/PAGE).is_file() or not (ROOT/'assets').is_dir():
        raise SystemExit('Put all three preview files beside index.html and the assets folder.')
    server = ThreadingHTTPServer(('127.0.0.1',0),Preview)
    url = 'http://127.0.0.1:'+str(server.server_port)+'/'+PAGE
    print('MINZ V7 preview: '+url+'\nKeep this window open. Ctrl+C to stop.',flush=True)
    threading.Timer(0.25,lambda:webbrowser.open(url)).start()
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally: server.server_close()
