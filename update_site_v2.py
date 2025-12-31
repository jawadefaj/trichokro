import os
import re

pages = ['index', 'founder', 'pathfinder', 'trambulance', 'blog', 'contact', 'resources', 'privacy', 'metadata']
langs = {
    'en': {'name': 'EN', 'suffix': ''},
    'bn': {'name': 'BN', 'suffix': '_bn'},
    'de': {'name': 'DE', 'suffix': '_de'},
    'es': {'name': 'ES', 'suffix': '_es'},
    'zh': {'name': 'ZH', 'suffix': '_zh'},
    'ja': {'name': 'JA', 'suffix': '_ja'}
}

# Expanded Translations for Link Text and Content
translations = {
    'de': {
        'HOME': 'STARTSEITE', 'ABOUT US': 'ÜBER UNS', 'ENGINEERING': 'TECHNIK', 'PRODUCTS': 'PRODUKTE', 
        'WHY US': 'WARUM WIR', 'FOUNDERS': 'GRÜNDER', 'CONTACTS': 'KONTAKT', 'TRAMBULANCE': 'TRAMBULANZ',
        'Gallery': 'Galerie', 'Engineering Excellence': 'Ingenieurskunst', 'Collaboration and Recognition': 'Zusammenarbeit & Anerkennung',
        'Public Files & Resources': 'Dateien & Ressourcen', 'Read the full Article': 'Ganzen Artikel lesen',
        'Detailed Spec': 'Detaillierte Spezifikation', 'Configure Yours': 'Konfigurieren', 'View Models': 'Modelle ansehen',
        'The Solution': 'Die Lösung', 'The Crisis': 'Die Krise', 'Safety Hazards': 'Sicherheitsrisiken',
        'Get in Touch': 'Kontaktieren Sie uns', 'Book Meeting': 'Termin buchen', 'Visit': 'Besuchen', 'Call': 'Anrufen', 'Email': 'E-Mail',
        'Detailed Specifications': 'Detaillierte Spezifikationen', 'Back to Home': 'Zurück zur Startseite', 'Back': 'Zurück'
    },
    'es': {
        'HOME': 'INICIO', 'ABOUT US': 'NOSOTROS', 'ENGINEERING': 'INGENIERÍA', 'PRODUCTS': 'PRODUCTOS', 
        'WHY US': 'POR QUÉ NOSOTROS', 'FOUNDERS': 'FUNDADORES', 'CONTACTS': 'CONTACTO', 'TRAMBULANCE': 'TRAMBULANCIA',
        'Gallery': 'Galería', 'Engineering Excellence': 'Excelencia en Ingeniería', 'Collaboration and Recognition': 'Colaboración y Reconocimiento',
        'Public Files & Resources': 'Archivos y Recursos', 'Read the full Article': 'Leer artículo completo',
        'Detailed Spec': 'Especificación detallada', 'Configure Yours': 'Configurar', 'View Models': 'Ver Modelos',
        'The Solution': 'La Solución', 'The Crisis': 'La Crisis', 'Safety Hazards': 'Riesgos de Seguridad',
        'Get in Touch': 'Ponte en contacto', 'Book Meeting': 'Reservar cita', 'Visit': 'Visitar', 'Call': 'Llamar', 'Email': 'Correo',
        'Detailed Specifications': 'Especificaciones detalladas', 'Back to Home': 'Volver al Inicio', 'Back': 'Atrás'
    },
    'zh': {
        'HOME': '首页', 'ABOUT US': '关于我们', 'ENGINEERING': '工程', 'PRODUCTS': '产品', 
        'WHY US': '为什么选择我们', 'FOUNDERS': '创始人', 'CONTACTS': '联系方式', 'TRAMBULANCE': '救护车',
        'Gallery': '画廊', 'Engineering Excellence': '卓越工程', 'Collaboration and Recognition': '合作与认可',
        'Public Files & Resources': '文件与资源', 'Read the full Article': '阅读全文',
        'Detailed Spec': '详细规格', 'Configure Yours': '配置您的车辆', 'View Models': '查看车型',
        'The Solution': '解决方案', 'The Crisis': '危机', 'Safety Hazards': '安全隐患',
        'Get in Touch': '联系我们', 'Book Meeting': '预约会议', 'Visit': '访问', 'Call': '致电', 'Email': '电子邮件',
        'Detailed Specifications': '详细规格', 'Back to Home': '返回首页', 'Back': '返回'
    },
    'ja': {
        'HOME': 'ホーム', 'ABOUT US': '私たちについて', 'ENGINEERING': 'エンジニアリング', 'PRODUCTS': '製品', 
        'WHY US': '選ばれる理由', 'FOUNDERS': '創業者', 'CONTACTS': 'お問い合わせ', 'TRAMBULANCE': 'トランビュランス',
        'Gallery': 'ギャラリー', 'Engineering Excellence': '卓越した技術', 'Collaboration and Recognition': '協力と認定',
        'Public Files & Resources': 'ファイルとリソース', 'Read the full Article': '記事全文を読む',
        'Detailed Spec': '詳細仕様', 'Configure Yours': '構成する', 'View Models': 'モデルを見る',
        'The Solution': '解決策', 'The Crisis': '危機', 'Safety Hazards': '安全上の危険',
        'Get in Touch': 'お問い合わせ', 'Book Meeting': '会議を予約', 'Visit': '訪問', 'Call': '電話', 'Email': 'メール',
        'Detailed Specifications': '詳細な仕様', 'Back to Home': 'ホームに戻る', 'Back': '戻る'
    }
}

fonts = {
    'zh': '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet">',
    'ja': '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet">'
}

font_families = {
    'zh': "font-family: 'Noto Sans SC', system-ui, sans-serif;",
    'ja': "font-family: 'Noto Sans JP', system-ui, sans-serif;"
}

def generate_dropdown(current_lang, current_page_base):
    # Determine the correct z-index and positioning based on context if possible, 
    # but a generic high z-index is safer.
    
    # For pages like Contact/Resources which might have different navs, we might need a simpler button style.
    # Defaulting to the standard nav style.
    
    html = f"""
    <div class="relative group z-[10002] inline-block">
        <button class="interactive text-slate-300 hover:text-emerald-400 font-medium text-sm uppercase tracking-wide transition-colors flex items-center gap-1 px-3 py-2">
            <i class="fas fa-globe"></i> <span id="current-lang">{langs[current_lang]['name']}</span> <i class="fas fa-chevron-down text-xs"></i>
        </button>
        <div class="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 z-[10002]">
    """
    for code, info in langs.items():
        filename = f"{current_page_base}{info['suffix']}.html"
        label = info['name']
        active_class = "text-emerald-400" if code == current_lang else "text-slate-300"
        html += f'<a href="{filename}" class="block px-4 py-2 text-sm {active_class} hover:text-emerald-400 hover:bg-slate-800">{label}</a>\n'
    html += """
        </div>
    </div>
    """
    return html

def update_internal_links(content, lang):
    if lang == 'en': return content
    suffix = langs[lang]['suffix']
    
    # Identify internal links: href="page.html" or href="page.html#section"
    # We need to replace page.html with page_suffix.html
    
    for p in pages:
        # Pattern: href="page.html" or href="page.html?..." or href="page.html#..."
        # We use a negative lookbehind to ensure we don't double replace if run multiple times (though we rewrite file each time)
        # But we are reading from file which might already have _de.html if we are iterating. 
        # Actually, we should be careful. 
        # The safest way is to target the exact string "page.html"
        
        # Replace href="page.html" with href="page_suffix.html"
        # We need to handle 'index.html' -> 'index_de.html'
        
        pattern = f'href="{p}.html"'
        replacement = f'href="{p}{suffix}.html"'
        content = content.replace(pattern, replacement)
        
        pattern = f'href="{p}.html#'
        replacement = f'href="{p}{suffix}.html#'
        content = content.replace(pattern, replacement)
        
        pattern = f'href="{p}.html?'
        replacement = f'href="{p}{suffix}.html?'
        content = content.replace(pattern, replacement)

    return content

def update_file(page_base, lang):
    filename = f"{page_base}{langs[lang]['suffix']}.html"
    if not os.path.exists(filename):
        return

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Internal Links
    content = update_internal_links(content, lang)

    # 2. Inject Dropdown (Universal Replacement)
    # We look for ANY existing language toggle pattern and replace it.
    # Pattern 1: Standard Nav Language Toggle
    # Pattern 2: Contact Page "Back/Language" buttons
    
    dropdown_html = generate_dropdown(lang, page_base)
    
    # Specific handling for Contact Page (contact_*.html)
    # It has <a href="contact.html" ...>ENGLISH</a> fixed position.
    # We want to replace that specific absolute positioned element with the dropdown or place dropdown there.
    if page_base == 'contact':
        # Look for the fixed position language toggle
        # It looks like: <a href="contact.html" class="fixed top-6 left-32 ...">...</a>
        # Or in _bn: <a href="contact.html" ...>ENGLISH</a>
        
        contact_toggle_pattern = re.compile(r'<a href="[^"]*?" class="fixed top-6 left-32 z-50 flex items-center gap-2.*?</a>', re.DOTALL)
        if contact_toggle_pattern.search(content):
            # We replace this entirely with a fixed position dropdown
            # We need to wrap the dropdown in the fixed positioning classes
            fixed_dropdown = f"""
            <div class="fixed top-6 left-32 z-50">
                {dropdown_html}
            </div>
            """
            content = contact_toggle_pattern.sub(fixed_dropdown, content)
        elif lang != 'en': # If it wasn't found (maybe first run on en), we might need to add it? 
            # The English contact page doesn't have a toggle usually, or I need to check.
            # Assuming English contact page needs one added if not present.
            pass 

    # Specific handling for Blog/Resources/Privacy/Metadata (Simple Headers)
    # They usually have a "Back" button and maybe a toggle.
    # We will try to find the standard Nav replacement again for these if they share the navbar.
    # Resources/Privacy/Metadata share a simple nav bar: <nav ...> ... <a href="index.html">Back</a> ... </nav>
    
    # Generic Nav Replacement (As before, but more robust)
    nav_pattern = re.compile(r'(<div class="hidden md:flex items-center space-x-8".*?>)(.*?)(</div>)', re.DOTALL)
    match = nav_pattern.search(content)
    
    if match:
        nav_start = match.group(1)
        nav_content = match.group(2)
        nav_end = match.group(3)
        
        # Remove old toggles
        nav_content = re.sub(r'<a href="[^"]*?(index|founder|pathfinder)[^"]*?"[^>]*?>\s*(ENGLISH|English|বাংলা|Deutsch|Español|中文|日本語)\s*.*?</a>', '', nav_content, flags=re.DOTALL)
        
        # Remove any existing dropdowns to avoid duplication (if re-running)
        nav_content = re.sub(r'<div class="relative group z-\[10002\] inline-block">.*?</div>\s*</div>', '', nav_content, flags=re.DOTALL)

        # Translate Nav Items
        if lang in translations:
            t = translations[lang]
            for en_term, trans_term in t.items():
                nav_content = re.sub(f'>\s*{re.escape(en_term)}\s*<', f'>{trans_term}<', nav_content)

        new_nav_content = nav_content + dropdown_html
        content = content.replace(match.group(0), nav_start + new_nav_content + nav_end)

    # 3. Mobile Menu Update
    mobile_menu_pattern = re.compile(r'(<div id="mobile-menu".*?><div class="px-4 py-4 space-y-3 flex flex-col">)(.*?)(</div>\s*</div>)', re.DOTALL)
    mobile_match = mobile_menu_pattern.search(content)
    if mobile_match:
        mm_start = mobile_match.group(1)
        mm_content = mobile_match.group(2)
        mm_end = mobile_match.group(3)
        
        # Clean old toggles
        mm_content = re.sub(r'<a href="[^"]*?(index|founder)[^"]*?"[^>]*?>\s*(ENGLISH|English|বাংলা|Switch to.*?)\s*</a>', '', mm_content)
        
        # Translate Mobile Items
        if lang in translations:
            t = translations[lang]
            for en_term, trans_term in t.items():
                mm_content = re.sub(f'>\s*{re.escape(en_term)}\s*<', f'>{trans_term}<', mm_content)

        # Append all languages
        mobile_langs = ""
        for code, info in langs.items():
            # if code == lang: continue # Show all or hide current? Show all is easier.
            fname = f"{page_base}{info['suffix']}.html"
            mobile_langs += f'<a href="{fname}" class="block text-slate-300 hover:text-emerald-400 hover:bg-slate-800 px-4 py-3 rounded-lg transition-colors font-medium text-sm border-t border-slate-800">Language: {info["name"]}</a>\n'
        
        content = content.replace(mobile_match.group(0), mm_start + mm_content + mobile_langs + mm_end)

    # 4. Fonts injection (Ensuring only once)
    if lang in fonts:
        if fonts[lang] not in content:
            content = content.replace('</head>', f'{fonts[lang]}\n</head>')
    
    if lang in font_families:
        # Check if already replaced to avoid double replacement or just force it
        # We replaced "font-family: 'Inter'..." last time.
        # This regex replaces the font definition in CSS blocks
        content = re.sub(r"font-family:\s*'Inter',\s*sans-serif;", font_families[lang], content)
        content = re.sub(r"font-family:\s*system-ui,.*?;", font_families[lang], content)

    # 5. Body Translation
    if lang in translations:
        t = translations[lang]
        for en_term, trans_term in t.items():
            # Careful replacement
            content = re.sub(f'>\s*{re.escape(en_term)}\s*<', f'>{trans_term}<', content)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filename}")

# Run for all
for page in pages:
    for lang in langs.keys():
        update_file(page, lang)
