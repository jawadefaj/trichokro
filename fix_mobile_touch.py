import re

# CSS to add before closing </style> tag
css_addition = '''
/* Mobile touch-friendly popup */
@media (max-width: 768px) {
    .team-card-popup {
        display: none !important;
    }
    
    .team-member-card {
        min-height: 120px;
        min-width: 120px;
    }
    
    /* Make cards more touch-friendly */
    .team-member-card:active {
        transform: scale(0.95);
        background-color: rgba(15, 23, 42, 0.9) !important;
    }
}

/* Desktop: show popup on hover */
@media (min-width: 769px) {
    .team-member-card:hover .team-card-popup {
        opacity: 1 !important;
        pointer-events: auto !important;
        transform: scale(1) !important;
    }
}
'''

# Files to modify
files = ['index.html', 'index_bn.html', 'index_es.html']

def modify_file(filename):
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Add CSS before closing </style> tag
        if css_addition.strip() not in content:
            content = content.replace('    </style>', css_addition + '    </style>')
            print(f' Added CSS to {filename}')
        
        # 2. Add team-member-card class to all <a> tags containing team cards
        # Pattern: <a href="contact.html?id=...
        content = re.sub(
            r'(<a href="contact\.html\?id=[^"]+")(\s+class=")',
            r'\1 class="team-member-card ',
            content
        )
        # For <a> tags without class attribute
        content = re.sub(
            r'(<a href="contact\.html\?id=[^"]+")(\s+(?!class)[^>]*>)',
            r'\1 class="team-member-card"\2',
            content
        )
        
        # 3. Add team-card-popup class to popup divs
        # Find all popup divs (the ones with "Hover Popup" comment before them)
        content = re.sub(
            r'(<!-- Hover Popup -->[\s\n]*<div class="absolute bottom-full)',
            r'\1 team-card-popup',
            content
        )
        # Also add to divs that already have classes but missing team-card-popup
        content = re.sub(
            r'(<div class="absolute bottom-full[^"]*?)("(?!.*team-card-popup))',
            r'\1 team-card-popup\2',
            content
        )
        
        print(f' Modified team member cards in {filename}')
        
        # Write back
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True
    except Exception as e:
        print(f' Error modifying {filename}: {str(e)}')
        return False

# Process each file
print('Starting mobile touch fixes...\n')
for file in files:
    modify_file(file)

print('\n All files modified successfully!')
print('\nNote: index_de.html, index_ja.html, and index_zh.html appear to be simpler versions.')
print('They may not have the full team section with popups.')
