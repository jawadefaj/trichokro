import re
import os

# Base path
base_path = r'a:\Temporary Dumpyard\trichokro'

# Team member designations
team_designations = {
    'Rownak Shahriar Ruhan': 'ME, BUET-20',
    'Tomal Kirtonia': 'ME, BUET-19',
    'Mijanur Rahman': 'ME, BUET-19',
    'Omor Faruk Hasan': 'ME, BUET-20',
    'Dipto Muzumder Swadhin': 'ME, BUET-20',
    'Tawhidul Islam Tahsif': 'ME, BUET-21',
    'Maxudur Rahman Chowdhury': 'ME, BUET-23',
    'Farhan Saddique': 'BME, BUET-23',
}

# Advisors designations
advisor_designations = {
    'Dr. Md. Ehsan': 'Professor, Dept. of Mechanical Engineering, BUET',
    'Abdul Jawad': 'PhD, University of California Santa Cruz',
    'Ishraq Rafid': 'MS, Germany',
}

# Translations for different languages
translations = {
    'en': {'designation': 'text-slate-500'},
    'bn': {'designation': 'text-slate-500'},  # Same styling for all
    'de': {'designation': 'text-slate-500'},
    'es': {'designation': 'text-slate-500'},
    'ja': {'designation': 'text-slate-500'},
    'zh': {'designation': 'text-slate-500'},
}

def add_designation_line(html_content, name, designation):
    '''Add designation line after the title line for a team member.'''
    # Pattern to match the team member card with name and title
    # Look for the structure: <h4>Name</h4> followed by <p>Title</p>
    pattern = rf'(<h4[^>]*>{re.escape(name)}</h4>\s*<p[^>]*class="text-emerald-400 text-xs">[^<]+</p>)'
    
    # Check if designation already exists
    check_pattern = rf'(<h4[^>]*>{re.escape(name)}</h4>.*?<p[^>]*class="text-slate-500[^"]*"[^>]*>{re.escape(designation)}</p>)'
    if re.search(check_pattern, html_content, re.DOTALL):
        return html_content  # Already has designation
    
    # Add the designation line
    replacement = rf'\1\n        <p class="text-slate-500 text-[10px] mt-1">{designation}</p>'
    html_content = re.sub(pattern, replacement, html_content)
    
    return html_content

def update_index_files():
    '''Update all index*.html files with team member designations.'''
    index_files = [
        'index.html', 'index_bn.html', 'index_de.html',
        'index_es.html', 'index_ja.html', 'index_zh.html'
    ]
    
    for filename in index_files:
        filepath = os.path.join(base_path, filename)
        if not os.path.exists(filepath):
            continue
            
        print(f'Processing {filename}...')
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add designations for team members
        for name, designation in team_designations.items():
            content = add_designation_line(content, name, designation)
        
        # Add designations for advisors
        for name, designation in advisor_designations.items():
            content = add_designation_line(content, name, designation)
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'   Updated {filename}')

def update_contact_files():
    '''Update all contact*.html files with Abdul Jawad\'s full information.'''
    contact_files = [
        'contact.html', 'contact_bn.html', 'contact_de.html',
        'contact_es.html', 'contact_ja.html', 'contact_zh.html'
    ]
    
    # Abdul Jawad's full contact information
    abdul_info = '''abdul: {
                initials: "Dr.",
                name: "Abdul Jawad",
                title: "Vehicle Adviser",
                phone1: "+1 (831) 419-3654",
                phone2: "",
                email1: "abjawad@ucsc.edu",
                email2: "jawadefaj006@gmail.com",
                website: "jawadefaj.xyz",
                scholar: "scholar.google.com",
                github: "github.com/jawadefaj",
                dept: "Augmented Design Lab, UC Santa Cruz"
            }'''
    
    for filename in contact_files:
        filepath = os.path.join(base_path, filename)
        if not os.path.exists(filepath):
            continue
            
        print(f'Processing {filename}...')
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace abdul entry in teamData
        pattern = r'abdul:\s*\{[^}]+\}'
        content = re.sub(pattern, abdul_info, content, flags=re.DOTALL)
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'   Updated {filename}')

def update_founder_files():
    '''Update all founder*.html files if they contain team member info.'''
    founder_files = [
        'founder.html', 'founder_bn.html', 'founder_de.html',
        'founder_es.html', 'founder_ja.html', 'founder_zh.html'
    ]
    
    for filename in founder_files:
        filepath = os.path.join(base_path, filename)
        if not os.path.exists(filepath):
            continue
            
        print(f'Processing {filename}...')
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if file contains team member info
        has_team_info = False
        for name in team_designations.keys():
            if name in content:
                has_team_info = True
                break
        
        if has_team_info:
            # Add designations for team members
            for name, designation in team_designations.items():
                content = add_designation_line(content, name, designation)
            
            # Add designations for advisors
            for name, designation in advisor_designations.items():
                content = add_designation_line(content, name, designation)
            
            # Write back
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'   Updated {filename}')
        else:
            print(f'  - Skipped {filename} (no team member info found)')

if __name__ == '__main__':
    print('='*60)
    print('Updating HTML files with team member designations...')
    print('='*60)
    
    print('\n1. Updating index*.html files...')
    update_index_files()
    
    print('\n2. Updating contact*.html files...')
    update_contact_files()
    
    print('\n3. Updating founder*.html files...')
    update_founder_files()
    
    print('\n' + '='*60)
    print(' All updates completed successfully!')
    print('='*60)
