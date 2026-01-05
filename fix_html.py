import os
import re

# Define the files to update
files = [
    r'a:\Temporary Dumpyard\trichokro\index.html',
    r'a:\Temporary Dumpyard\trichokro\index_bn.html',
    r'a:\Temporary Dumpyard\trichokro\index_de.html',
    r'a:\Temporary Dumpyard\trichokro\index_es.html',
    r'a:\Temporary Dumpyard\trichokro\index_ja.html',
    r'a:\Temporary Dumpyard\trichokro\index_zh.html'
]

updated_files = []
failed_files = []

for file_path in files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix 1: Remove duplicate line for Farhan Saddique
        # Look for the pattern with both lines and remove the second one
        pattern1 = r'(<h4[^>]*>.*?Farhan Saddique.*?</h4>\s*<p[^>]*>Junior Associate</p>\s*<p[^>]*>BME, BUET-23</p>)\s*<p[^>]*>BUET BME \'23</p>'
        content = re.sub(pattern1, r'\1', content, flags=re.DOTALL | re.IGNORECASE)
        
        # Fix 2: Add missing 3rd line for Tomal Kirtonia (if missing)
        # Check if Tomal already has the education line
        if 'Tomal Kirtonia' in content:
            # Look for Tomal without the education line following Head of Design
            pattern2 = r'(<h4[^>]*>.*?Tomal Kirtonia.*?</h4>\s*<p[^>]*>Head of Design</p>)(\s*</a>)'
            if re.search(pattern2, content, flags=re.DOTALL):
                content = re.sub(pattern2, r'\1\n        <p class="text-slate-500 text-[10px] mt-1">ME, BUET-19</p>\2', content, flags=re.DOTALL)
        
        # Fix 3: Add missing 3rd line for Rakibul Hasan Shanto
        # Look for Rakibul without the education line
        pattern3 = r'(<h4[^>]*>.*?Rakibul Hasan Shanto.*?</h4>\s*<p[^>]*>Manufacturing Executive</p>)(\s*</a>)'
        content = re.sub(pattern3, r'\1\n            <p class="text-slate-500 text-[10px] mt-1">ME, BUET-20</p>\2', content, flags=re.DOTALL)
        
        # Write back only if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            updated_files.append(os.path.basename(file_path))
            print(f' Updated: {os.path.basename(file_path)}')
        else:
            print(f'- No changes needed: {os.path.basename(file_path)}')
            
    except Exception as e:
        failed_files.append(os.path.basename(file_path))
        print(f' Failed: {os.path.basename(file_path)} - {str(e)}')

print(f'\n=== Summary ===')
print(f'Successfully updated: {len(updated_files)} files')
if updated_files:
    for f in updated_files:
        print(f'  - {f}')
        
if failed_files:
    print(f'\nFailed: {len(failed_files)} files')
    for f in failed_files:
        print(f'  - {f}')
