# PowerShell script to fix mobile touch interactions

$cssAddition = @'
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
'@

$files = @('index.html', 'index_bn.html', 'index_es.html', 'index_de.html', 'index_ja.html', 'index_zh.html')

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file..." -ForegroundColor Cyan
        
        $content = Get-Content -Path $file -Raw -Encoding UTF8
        
        # 1. Add CSS before closing </style> tag if not already present
        if ($content -notlike "*team-card-popup*") {
            $content = $content -replace '(    </style>)', "$cssAddition
$1"
            Write-Host "   Added CSS" -ForegroundColor Green
        }
        
        # 2. Add team-member-card class to <a> tags
        $content = $content -replace '(<a href="contact\.html\?id=[^"]+")(\s+class="[^"]*")', '$1 class="team-member-card $2'
        $content = $content -replace '(<a href="contact\.html\?id=[^"]+")(\s+class=")', '$1 class="team-member-card $2'
        # For <a> without existing class
        $content = $content -replace '(<a href="contact\.html\?id=[^"]+")(\s+(?!class))', '$1 class="team-member-card" $2'
        
        # 3. Add team-card-popup class to popup divs
        $content = $content -replace '(<!-- Hover Popup -->\s*<div class="absolute bottom-full)', '$1 team-card-popup'
        $content = $content -replace '(<div class="absolute bottom-full[^"]+)"([^>]*>)(?!.*team-card-popup)', '$1 team-card-popup"$2'
        
        Write-Host "   Modified team member cards" -ForegroundColor Green
        
        # Write back
        $content | Set-Content -Path $file -Encoding UTF8 -NoNewline
        Write-Host "   Saved $file
" -ForegroundColor Green
    } else {
        Write-Host "   $file not found
" -ForegroundColor Yellow
    }
}

Write-Host "
 All files processed!" -ForegroundColor Green
