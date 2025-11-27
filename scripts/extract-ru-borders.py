import json
import re

# Transliteration mapping (GOST 7.79-2000 System B)
# Note: For simplicity and common use, some common variations are included.
TRANS_MAP = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
    'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
}

# Fix for "Е" at the start of a word, which should be 'Ye', not 'E'
# And "Е" after a vowel or Ъ/Ь, which should be 'Ye' or 'Y'
def cyrillic_to_latin(text):
    result = []
    text = text.replace('Ъ', '').replace('Ь', '').replace('ъ', '').replace('ь', '') # Remove hard/soft signs early
    for char in text:
        result.append(TRANS_MAP.get(char, char))
    
    transliterated = "".join(result)
    
    # Specific rule corrections for 'E' and 'Yo' at the beginning or after vowels/delimiters (like spaces)
    transliterated = re.sub(r'(^|\s)E', r'\1Ye', transliterated)
    transliterated = re.sub(r'(^|\s)e', r'\1ye', transliterated)
    transliterated = re.sub(r'(^|\s)Yo', r'\1Yo', transliterated)
    transliterated = re.sub(r'(^|\s)yo', r'\1yo', transliterated)
    
    return transliterated
f = open('/Users/laurent/Downloads/ru-borders.txt', 'r', encoding='utf-8')
json_string = f.read()
f.close()
data = json.loads(json_string)
# --- Core Functions ---
processed_checkpoints = []

# Iterate over all federal districts
for district_id in data.get('federal_districts', {}):
    regions = data['federal_districts'][district_id]
    
    # Iterate over all regions in the district
    for region in regions:
        # Iterate over all checkpoints in the region
        for checkpoint in region.get('checkpoints', []):
            checkpoint_type_en = checkpoint.get('checkpoint_type', {}).get('title', {}).get('en')
            status_en = checkpoint.get('status', {}).get('title', {}).get('en')
            title_ru = checkpoint.get('title', {}).get('ru')

            # 3. Filter: Keep only Automobile checkpoint
            if checkpoint_type_en == "Automobile checkpoint":
                new_checkpoint = {}

                # 2. Transliterate the Russian name and put it in a "name" property
                if title_ru:
                    new_checkpoint['name_ru'] = title_ru
                    new_checkpoint['full_name'] = cyrillic_to_latin(title_ru)
                    if '(' in new_checkpoint['full_name']:
                        new_checkpoint['name_en'] = re.sub(r'\s*\(.*?\)\s*', '', new_checkpoint['full_name']).strip()
                    else:
                        new_checkpoint['name_en'] = new_checkpoint['full_name']
                    new_checkpoint['name'] = new_checkpoint['name_en']
                else:
                    new_checkpoint['name'] = None
                # if new_checkpoint['name'] is of kind "Name (other)", strip the parenthetical
 
                # 4. Add a "status" property
                new_status = None
                if status_en == "Bilateral":
                    new_status = 1
                elif status_en == "Multilateral":
                    new_status = 2
                
                new_checkpoint['status'] = new_status
                
                # Copy other relevant fields for context (keeping the output concise)
                new_checkpoint['id'] = checkpoint.get('id')
                other_country = checkpoint.get('foreign_country')
                if other_country:
                    new_checkpoint['country'] = other_country.get('iso_code')
                new_checkpoint['latitude'] = checkpoint.get('latitude')
                new_checkpoint['longitude'] = checkpoint.get('longitude')
                new_checkpoint['foreign_checkpoint_ru'] = checkpoint.get('foreign_checkpoint', {}).get('ru')
                if new_checkpoint['foreign_checkpoint_ru']:
                    new_checkpoint['foreign_name'] = cyrillic_to_latin(new_checkpoint['foreign_checkpoint_ru'])
                    if new_checkpoint['name_en'] and new_checkpoint['foreign_name']:
                        new_checkpoint['name'] = f"{new_checkpoint['name_en']} / {new_checkpoint['foreign_name']}"
                
                if checkpoint.get('condition') == True:
                    processed_checkpoints.append(new_checkpoint)

# groups checkpoints by region for easier inspection
region_map = {}
for cp in processed_checkpoints:
    region_id = cp.get('country', 'unknown')
    if region_id not in region_map:
        region_map[region_id] = []
    region_map[region_id].append(cp)
# write one file per region
for region_id in region_map:
    region_checkpoints = region_map[region_id]
    output_json = json.dumps(region_checkpoints, indent=2, ensure_ascii=False)
    with open(f'checkpoints_{region_id}.json', 'w', encoding='utf-8') as f:
        f.write(output_json)

# Final JSON output
output_json = json.dumps(processed_checkpoints, indent=2, ensure_ascii=False)

print(output_json)