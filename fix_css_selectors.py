import glob

for filepath in glob.glob("*.html"):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if '.btn-deep-gradient btn-ripple' in content:
        content = content.replace('.btn-deep-gradient btn-ripple', '.btn-deep-gradient')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed CSS style block in {filepath}")
