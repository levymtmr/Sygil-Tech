#!/usr/bin/env python3
"""Instala ferramentas locais para APK de teste, sem sudo/Android Studio."""
from pathlib import Path
import os, shutil, subprocess, sys, tarfile, urllib.request, zipfile, struct, zlib, time
ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / '.tools'
TOOLS.mkdir(exist_ok=True)
VERSION = '4.4.1'
def download(url, dest):
    if dest.exists() and dest.stat().st_size > 10000:
        return
    print('Baixando', dest.name, flush=True)
    partial=dest.with_name(dest.name+'.part')
    subprocess.run(['curl', '-fL', '-C', '-', '--retry', '5', '--retry-all-errors', '--connect-timeout', '30', url, '-o', str(partial)], check=True)
    partial.replace(dest)

def extract_template():
    out=TOOLS/'templates'/f'{VERSION}.stable'
    out.mkdir(parents=True, exist_ok=True)
    apk=out/'android_debug.apk'
    if apk.exists(): return
    # HTTP ranges extract just Android's debug template instead of downloading
    # every platform's export templates (over 1 GB).
    url=f'https://godot-releases.nbg1.your-objectstorage.com/{VERSION}-stable/Godot_v{VERSION}-stable_export_templates.tpz'
    req=urllib.request.Request(url, method='HEAD')
    with urllib.request.urlopen(req, timeout=90) as r:
        resolved=r.url
        length=int(r.headers['Content-Length'])
    def chunk(start, end):
        req=urllib.request.Request(resolved, headers={'Range':f'bytes={start}-{end}'})
        for attempt in range(5):
            try:
                with urllib.request.urlopen(req, timeout=180) as r:
                    if r.status != 206: raise RuntimeError('Servidor não aceitou HTTP Range')
                    return r.read()
            except Exception:
                if attempt==4: raise
                time.sleep(2)
    tail=chunk(max(0,length-131072),length-1)
    eocd=tail.rfind(b'PK\x05\x06')
    if eocd<0: raise RuntimeError('Diretório do ZIP não encontrado')
    _,_,_,_,_,cdsize,cdoffset,_=struct.unpack_from('<4s4H2IH', tail,eocd)
    directory=chunk(cdoffset,cdoffset+cdsize-1)
    pos=0
    while directory[pos:pos+4]==b'PK\x01\x02':
        h=struct.unpack_from('<4s6H3I5H2I',directory,pos)
        method=h[4]; compressed=h[8]; name_len=h[10]; extra=h[11]; comment=h[12]; offset=h[16]
        name=directory[pos+46:pos+46+name_len].decode()
        if name.endswith('/android_debug.apk'):
            print('Extraindo somente android_debug.apk do pacote oficial',flush=True)
            header=chunk(offset,offset+29)
            local=struct.unpack('<4s5H3I2H',header)
            data_start=offset+30+local[-2]+local[-1]
            packed=chunk(data_start,data_start+compressed-1)
            data=zlib.decompress(packed,-15) if method==8 else packed
            if zlib.crc32(data) & 0xffffffff != h[7]: raise RuntimeError('CRC incorreto')
            apk.write_bytes(data)
            print('Template pronto',flush=True)
            return
        pos+=46+name_len+extra+comment
    raise RuntimeError('android_debug.apk não está no pacote')

if '--templates-only' in sys.argv:
    extract_template()
    sys.exit(0)

engine=TOOLS/'godot4'
if not engine.exists():
    archive=TOOLS/'godot4.zip'
    download(f'https://github.com/godotengine/godot-builds/releases/download/{VERSION}-stable/Godot_v{VERSION}-stable_linux.x86_64.zip', archive)
    with zipfile.ZipFile(archive) as f:
        name=next(n for n in f.namelist() if n.endswith('.x86_64'))
        engine.write_bytes(f.read(name))
    engine.chmod(0o755)
jdk=TOOLS/'jdk' 
if not (jdk/'bin/java').exists():
    archive=TOOLS/'jdk17.tar.gz'
    download('https://aka.ms/download-jdk/microsoft-jdk-17.0.21.0.2-linux-x64.tar.gz',archive)
    staging=TOOLS/'jdk-extract'
    staging.mkdir(exist_ok=True)
    with tarfile.open(archive) as f: f.extractall(staging,filter='data')
    shutil.move(str(next(staging.iterdir())),str(jdk))
sdk=TOOLS/'android-sdk'
manager=sdk/'cmdline-tools/latest/bin/sdkmanager'
if not manager.exists():
    archive=TOOLS/'android-cli.zip'
    download('https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip',archive)
    tmp=TOOLS/'android-extract'
    with zipfile.ZipFile(archive) as f: f.extractall(tmp)
    (sdk/'cmdline-tools').mkdir(parents=True,exist_ok=True)
    shutil.move(str(tmp/'cmdline-tools'),str(sdk/'cmdline-tools/latest'))
    for p in (sdk/'cmdline-tools/latest/bin').iterdir(): p.chmod(0o755)
env=dict(os.environ,JAVA_HOME=str(jdk),ANDROID_HOME=str(sdk),ANDROID_SDK_ROOT=str(sdk))
env['PATH']=str(jdk/'bin')+':'+env['PATH']
# Standard Android SDK licenses, for locally installed build dependencies.
subprocess.run(['bash',str(manager),f'--sdk_root={sdk}','--licenses'],input='y\n'*100,text=True,env=env,check=True,stdout=subprocess.DEVNULL)
subprocess.run(['bash',str(manager),f'--sdk_root={sdk}','platform-tools','build-tools;34.0.0','platforms;android-34'],env=env,check=True)
for name in ['apksigner','zipalign','aapt','aapt2']:
    p=sdk/'build-tools/34.0.0'/name
    if p.exists(): p.chmod(0o755)
for p in (sdk/'platform-tools').iterdir():
    if p.is_file() and p.suffix=='': p.chmod(0o755)
extract_template()
key=TOOLS/'debug.keystore'
if not key.exists():
    subprocess.run([str(jdk/'bin/keytool'),'-genkeypair','-keystore',str(key),'-storepass','android','-alias','androiddebugkey','-keypass','android','-dname','CN=Android Debug,O=Android,C=US','-keyalg','RSA','-keysize','2048','-validity','10000'],check=True)
# Project-local editor settings keep the user's Godot settings untouched.
config=TOOLS/'config/godot'
config.mkdir(parents=True,exist_ok=True)
settings='[gd_resource type="EditorSettings" format=3]\n\n[resource]\n'
settings+=f'export/android/android_sdk_path = "{sdk}"\nexport/android/java_sdk_path = "{jdk}"\nexport/android/debug_keystore = "{key}"\n'
(config/'editor_settings-4.4.tres').write_text(settings)
(config/'editor_settings-4.7.tres').write_text(settings)
print('Android pronto. Execute ./tools/export_apk.sh',flush=True)
