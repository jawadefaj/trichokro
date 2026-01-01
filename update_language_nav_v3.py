import os
import re

# Configuration
pages = ['index', 'founder', 'pathfinder', 'trambulance', 'blog', 'contact', 'resources', 'privacy', 'metadata']
langs = {
    'en': {'name': 'EN', 'suffix': ''},
    'bn': {'name': 'BN', 'suffix': '_bn'},
    'de': {'name': 'DE', 'suffix': '_de'},
    'es': {'name': 'ES', 'suffix': '_es'},
    'zh': {'name': 'ZH', 'suffix': '_zh'},
    'ja': {'name': 'JA', 'suffix': '_ja'}
}

# Icon mapping (using FontAwesome classes as seen in the files)
icons = {
    'globe': '<i class="fas fa-globe"></i>',
    'chevron': '<i class="fas fa-chevron-down text-xs ml-1"></i>'
}

def generate_dropdown(current_lang, current_page_base, is_fixed=False):
    """
    Generates the HTML for the language dropdown.
    """
    
    # Base styling
    if is_fixed:
        # Style for Contact page (fixed position)
        container_class = "fixed top-6 left-32 z-50 relative group"
        # For the button, we match the contact page style
        button_class = "flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-slate-700 hover:text-emerald-700 hover:bg-white/40 transition-all duration-300 shadow-lg"
        # Dropdown menu positioning
        menu_class = "absolute left-0 mt-2 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left z-[10002]"
        text_color = "text-slate-700" # Initial text color for button
    else:
        # Style for Navbar
        container_class = "relative group z-[10002] inline-block ml-4"
        button_class = "flex items-center gap-1 text-slate-300 hover:text-emerald-400 font-medium text-sm uppercase tracking-wide transition-colors focus:outline-none"
        menu_class = "absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right z-[10002]"
        text_color = "text-slate-300"

    current_lang_name = langs[current_lang]['name']
    
    html = f'''
    <div class="{container_class}">
        <button class="{button_class}">
            {icons['globe'] if not is_fixed else ''}
            <span class="{ 'font-medium font-sans' if is_fixed else ''}">{current_lang_name}</span>
            {icons['chevron'] if not is_fixed else ''}
        </button>
        <div class="{menu_class}">
            <div class="py-1">
'''
    
    for code, info in langs.items():
        # Construct the target filename
        target_file = f"{current_page_base}{info['suffix']}.html"
        
        # Determine styling for active/inactive links
        if code == current_lang:
            item_class = "block px-4 py-2 text-sm text-emerald-400 bg-slate-800 font-bold"
        else:
            item_class = "block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-emerald-400"
            
        html += f'                <a href="{target_file}" class="{item_class}">{info["name"]}</a>\n'

    html += '''            </div>
        </div>
    </div>'''
    
    return html

def update_internal_links(content, current_lang):
    """
    Updates links to other pages to point to the correct language version.
    E.g. in index_de.html, href="founder.html" becomes href="founder_de.html"
    """
    if current_lang == 'en':
        return content # English uses base filenames
        
    suffix = langs[current_lang]['suffix']
    
    # Iterate through all known page bases to replace their links
    for p in pages:
        # Regex to match href="page.html" but NOT href="page_suffix.html" already
        # We need to be careful. Simplest is to replace "page.html" with "page_suffix.html"
        # provided it's not already "page_suffix.html".
        
        # We target specific anchor tag patterns to avoid breaking other things
        # Pattern 1: href="page.html"
        # Pattern 2: href="page.html#..."
        # Pattern 3: href="page.html?..."
        
        # We perform a negative lookahead to ensure we don't double append suffix
        # Regex: href="page.html(?!_)" -> checks if not followed by underscore? No, suffix starts with _.
        # But wait, suffix is e.g. '_de'. 
        # If we have "index.html", we want "index_de.html".
        # If we have "index_de.html", we leave it? No, the source usually has "index.html" (from EN copy)
        # or "index_de.html" (if previously processed).
        
        # Strategy: Revert to base first, then apply suffix.
        # This handles re-runs idempotently.
        
        # 1. Revert any known suffixes for this page to base
        # This is risky if we have mixed links. 
        # Let's assume the content might have base links that need updating.
        
        # Regex to find href="page.html..."
        # We'll use a callback to append suffix if missing
        
        def replace_link(match):
            full_match = match.group(0) # e.g. href="founder.html"
            quote = full_match[5] # " or '
            url = full_match[6:-1] # founder.html
            
            # Check if it's strictly the page we are looking for
            # e.g. "founder.html", "founder.html#...", "founder.html?..."
            
            if url.startswith(f"{p}.html"):
                # Check if it already has a suffix from our supported list
                has_suffix = False
                for s_lang, s_info in langs.items():
                    s_suffix = s_info['suffix']
                    if s_suffix and f"{p}{s_suffix}.html" in url:
                        has_suffix = True
                        break
                
                if not has_suffix:
                    # Insert suffix before .html
                    new_url = url.replace(f"{p}.html", f"{p}{suffix}.html")
                    return f'href={quote}{new_url}{quote}'
            
            return full_match

        # Matches href="founder.html..." using simplified logic
        # We match href followed by quote, then page name, then .html, then optional content, then quote
        pattern = re.compile(f'href=["\']{p}\.html.*?["\']')
        content = pattern.sub(replace_link, content)
        
    return content

def update_file(page_base, lang):
    suffix = langs[lang]['suffix']
    filename = f"{page_base}{suffix}.html"
    
    if not os.path.exists(filename):
        print(f"Skipping {filename} (File not found)")
        return

    print(f"Processing {filename}...")
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Internal Links (Crucial for "Connect all pages")
    content = update_internal_links(content, lang)

    # 2. Update Navigation Bar (Desktop)
    dropdown_html = generate_dropdown(lang, page_base, is_fixed=(page_base == 'contact'))

    if page_base == 'contact':
        # Strategy for Contact Page: 
        # Find the existing fixed position toggle or the comment marker
        
        # Regex for existing fixed toggle (both <a> and <div> versions)
        # Matches: <a ... class="fixed top-6 left-32 ...">...</a>
        # OR <div ... class="fixed top-6 left-32 ...">...</div>
        toggle_pattern = re.compile(r'(<a|<div)[^>]*?class="fixed top-6 left-32[^"]*?"[^>]*?>.*?(</a>|</div>\s*</div>)', re.DOTALL)
        
        match = toggle_pattern.search(content)
        if match:
            # Replace found toggle with new dropdown
            content = content.replace(match.group(0), dropdown_html)
        else:
            # Fallback: Look for the Back button and insert after it
            back_btn_pattern = re.compile(r'(<a href="javascript:history\.back\(\)".*?</a>)', re.DOTALL)
            if back_btn_pattern.search(content):
                content = back_btn_pattern.sub(r'\1\n    ' + dropdown_html, content)
            else:
                print(f"Warning: Could not find insertion point for language toggle in {filename}")

    else:
        # Navbar Pages (index, founder, etc.)
        # We look for the Navbar container
        nav_container_pattern = re.compile(r'(<div class="hidden md:flex items-center space-x-8".*?>)(.*?)(</div>)', re.DOTALL)
        match = nav_container_pattern.search(content)
        
        if match:
            nav_start = match.group(1)
            nav_content = match.group(2)
            nav_end = match.group(3)
            
            # Remove any existing Language Links or Dropdowns
            # 1. Remove individual links like <a ...>বাংলা</a> or <a ...>ENGLISH</a>
            # We target specific known labels or patterns
            lang_labels = [l['name'] for l in langs.values()] + ["বাংলা", "ENGLISH", "English"]
            for label in lang_labels:
                # Regex to remove anchor tag containing exact label text
                # <a ...> LABEL <span>...</span> </a>
                # We use a broad pattern to catch the link
                link_regex = re.compile(r'<a\s+href="[^"]*?"[^>]*?>\s*' + re.escape(label) + r'.*?</a>', re.DOTALL | re.IGNORECASE)
                nav_content = link_regex.sub('', nav_content)

            # 2. Remove existing dropdowns (div with relative group ...)
            # Identify by unique class or structure if previously added
            dropdown_regex = re.compile(r'<div class="relative group z-\[10002\] inline-block.*?</div>\s*</div>', re.DOTALL)
            nav_content = dropdown_regex.sub('', nav_content)

            # 3. Clean up whitespace/orphaned spans
            nav_content = re.sub(r'\s+', ' ', nav_content).strip()

            # 4. Insert new Dropdown
            # We want to insert it before the "Contacts" button usually.
            # "Contacts" button usually has class "btn-deep-gradient" or text "Contacts" / "Contact"
            
            contact_btn_match = re.search(r'<a[^>]*?(Contact|CONTACT|jogajog|যোগাযোগ)[^>]*?>', nav_content, re.IGNORECASE)
            
            if contact_btn_match:
                # Insert before the contact button
                insertion_index = contact_btn_match.start()
                new_nav = nav_content[:insertion_index] + dropdown_html + " " + nav_content[insertion_index:]
            else:
                # Append to end if no contact button found
                new_nav = nav_content + " " + dropdown_html

            content = content.replace(match.group(0), nav_start + new_nav + nav_end)
        else:
             print(f"Warning: Navbar not found in {filename}")

    # 3. Update Mobile Menu
    # Pattern: <div id="mobile-menu" ...> ... </div>
    mobile_menu_pattern = re.compile(r'(<div id="mobile-menu".*?><div class="px-4 py-4 space-y-3 flex flex-col">)(.*?)(</div>\s*</div>)', re.DOTALL)
    mobile_match = mobile_menu_pattern.search(content)
    
    if mobile_match:
        mm_start = mobile_match.group(1)
        mm_content = mobile_match.group(2)
        mm_end = mobile_match.group(3)
        
        # Remove existing language links from mobile menu
        lang_labels = [l['name'] for l in langs.values()] + ["বাংলা", "ENGLISH", "English"]
        for label in lang_labels:
             link_regex = re.compile(r'<a\s+href="[^"]*?"[^>]*?>\s*' + re.escape(label) + r'.*?</a>', re.DOTALL | re.IGNORECASE)
             mm_content = link_regex.sub('', mm_content)
        
        # Also remove any "Language: ..." links we might have added previously
        mm_content = re.sub(r'<a\s+href="[^"]*?"[^>]*?>\s*Language:.*?</a>', '', mm_content, flags=re.DOTALL)

        # Build new Mobile Language List
        # We can add a divider and then the languages
        mobile_langs_html = '\n                    <div class="border-t border-slate-800 pt-2 mt-2">\n'
        mobile_langs_html += '                        <p class="text-xs text-slate-500 px-4 mb-2 uppercase tracking-widest">Language</p>\n'
        mobile_langs_html += '                        <div class="grid grid-cols-3 gap-2 px-4">\n'
        
        for code, info in langs.items():
            fname = f"{page_base}{info['suffix']}.html"
            active_class = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" if code == lang else "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
            mobile_langs_html += f'                            <a href="{fname}" class="text-center py-2 rounded-lg text-xs font-bold transition-colors {active_class}">{info["name"]}</a>\n'
        
        mobile_langs_html += '                        </div>\n                    </div>'
        
        content = content.replace(mobile_match.group(0), mm_start + mm_content + mobile_langs_html + mm_end)

    # Write changes
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    for page in pages:
        for lang in langs.keys():
            update_file(page, lang)
