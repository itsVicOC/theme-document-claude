"""Build an installable ZIP with style.css directly at the archive root.

WordPress uses the ZIP basename (theme-document) as the installation directory.
Explicit directory records and normalized permissions support both extractors.
"""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import os
import stat

root = Path(__file__).resolve().parent.parent
target = root / 'dist' / 'theme-document.zip'
target.parent.mkdir(exist_ok=True)
excluded = {'.git', 'node_modules', 'dist', 'tests', 'scripts', 'docs', '.wordpress-playground', '__pycache__'}
excluded_files = {'package.json', 'package-lock.json', '.gitignore', '.DS_Store'}
files = []
for folder, directories, names in os.walk(root):
    directories[:] = sorted(d for d in directories if d not in excluded)
    for name in names:
        if name not in excluded_files:
            path = Path(folder) / name
            files.append((path.relative_to(root).as_posix(), path))

required = {'style.css', 'index.php', 'functions.php'}
assert required <= {name for name, _ in files}, 'Missing required theme files'
assert 'Theme Name:' in (root / 'style.css').read_text()[:8192], 'Missing theme header'

# Keep the required theme files visible first in archive viewers.
files.sort(key=lambda item: (0 if item[0] in required else 1, item[0]))
with ZipFile(target, 'w', ZIP_DEFLATED) as archive:
    directories = set()
    for name, path in files:
        for parent in reversed(Path(name).parents):
            if str(parent) == '.':
                continue
            directory = parent.as_posix() + '/'
            if directory not in directories:
                info = ZipInfo(directory)
                info.create_system = 3
                info.external_attr = ((stat.S_IFDIR | 0o755) << 16) | 0x10
                archive.writestr(info, b'')
                directories.add(directory)
        info = ZipInfo(name)
        info.create_system = 3
        info.external_attr = (stat.S_IFREG | 0o644) << 16
        info.compress_type = ZIP_DEFLATED
        archive.writestr(info, path.read_bytes())

with ZipFile(target) as archive:
    assert archive.testzip() is None
    assert required <= set(archive.namelist())
print(target)
