import codecs

# Read the file with UTF-8 encoding
with codecs.open(r'a:\Temporary Dumpyard\trichokro\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the broken emoji line with proper emojis
old_line = "            const emojis = ['ðŸŒ', 'ðŸ"', 'âš', 'âï¸', 'ðŸŒž', 'ðŸƒ', 'ðŸŒ¦ï¸', 'ðŸš²', 'ðŸŒŽ', 'ðŸ'¡', 'ðŸ¤–', 'ðŸ'»', 'ðŸ"Œ', 'âš™ï¸', 'ðŸ› ï¸', 'ðŸš', 'ðŸ"', 'âš', 'ðŸ"', 'ðŸŒ'];"
new_line = "            const emojis = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];"

# Also remove the duplicate line that was added
duplicate_line = "            const emojis = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];"

content = content.replace(old_line, new_line)
content = content.replace(duplicate_line, "")

# Write back with UTF-8 encoding
with codecs.open(r'a:\Temporary Dumpyard\trichokro\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully fixed emoji encoding!")
