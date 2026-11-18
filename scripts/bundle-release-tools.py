"""Build the docs download from an explicit allowlist, with stable archive metadata."""
import gzip
import sys
import tarfile
from pathlib import Path

tools = Path(sys.argv[1])
with (tools / "release-tools.tar.gz").open("wb") as output:
    with gzip.GzipFile(fileobj=output, filename="", mode="wb", mtime=0) as zipped:
        with tarfile.open(fileobj=zipped, mode="w|", format=tarfile.USTAR_FORMAT) as archive:
            for name in ("release-kit.sh", "backup-instance.sh", "restore-instance.sh"):
                source = tools / name
                member = tarfile.TarInfo(name)
                member.size = source.stat().st_size
                member.mode = 0o755
                with source.open("rb") as contents:
                    archive.addfile(member, contents)
