"""Package only the public website; never include reports, drafts or browser state."""
from pathlib import Path
import shutil
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'_site'
if OUT.exists():shutil.rmtree(OUT)
OUT.mkdir()
for source in ROOT.iterdir():
    if source.is_file() and source.suffix in {'.html','.css','.js'}:
        shutil.copy2(source,OUT/source.name)
allowed={'.png','.jpg','.jpeg','.webp','.svg','.gif','.mp4','.webm','.mov','.woff','.woff2','.ttf','.otf','.avif','.ico'}
for source in (ROOT/'assets').rglob('*'):
    if source.is_symlink():raise RuntimeError('Symlinks are not allowed in deployment: '+str(source))
    if source.is_file() and source.suffix.lower() in allowed:
        if source.stat().st_size>=100*1024*1024:raise RuntimeError('File exceeds GitHub individual file limit: '+str(source))
        target=OUT/source.relative_to(ROOT);target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
(OUT/'.nojekyll').touch()
assert (OUT/'index.html').exists()
print('Website packaged:',sum(f.is_file() for f in OUT.rglob('*')),'files')
