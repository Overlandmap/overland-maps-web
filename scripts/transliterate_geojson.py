# transliterate_geojson.py
# Usage: python3 transliterate_geojson.py
import json, re, sys, os

input_path = "kaz-avto.geojson"
output_path = "kaz-avto-transliterated.geojson"

# Mapping Cyrillic -> Latin (Russian + Kazakh-specific letters approximated)
mapping = {
    'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'E','Ё':'Yo','Ж':'Zh','З':'Z','И':'I','Й':'Y','К':'K','Л':'L','М':'M',
    'Н':'N','О':'O','П':'P','Р':'R','С':'S','Т':'T','У':'U','Ф':'F','Х':'Kh','Ц':'Ts','Ч':'Ch','Ш':'Sh','Щ':'Shch','Ъ':'',
    'Ы':'Y','Ь':'','Э':'E','Ю':'Yu','Я':'Ya',
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m',
    'н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'',
    'ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
    # Kazakh letters
    'Ә':'A','ә':'a','Ө':'O','ө':'o','Ұ':'U','ұ':'u','Ү':'U','ү':'u','Қ':'Q','қ':'q','Ғ':'Gh','ғ':'gh','Ң':'Ng','ң':'ng','Һ':'H','һ':'h','І':'I','і':'i',
}

def transliterate(text):
    """Remove internal quotes, transliterate Cyrillic letters to Latin approximation, and capitalize."""
    if not isinstance(text, str):
        return text
    # remove various quote characters that might be embedded
    for ch in ['“','”','«','»','"', "'", '’', '‘', "`"]:
        text = text.replace(ch, '')
    # transliterate char-by-char
    out = []
    for ch in text:
        out.append(mapping.get(ch, ch))
    result = ''.join(out)
    # collapse multiple spaces, strip edges
    result = re.sub(r'\s+', ' ', result).strip()
    # capitalize each word (title case)
    result = result.title()
    return result

def extract_status(description):
    """Extract status from description and return numeric value.
    
    Returns:
        1 for Двухсторонний (bilateral)
        2 for Многосторонний (multilateral)
        None if status not found
    """
    if not isinstance(description, str):
        return None
    
    # Look for "Статус:" followed by the status value
    status_match = re.search(r'Статус:\s*([^\n<]+)', description)
    if status_match:
        status_text = status_match.group(1).strip()
        
        # Check for bilateral (Двухсторонний)
        if 'Двухсторонний' in status_text or 'двухсторонний' in status_text:
            return 1
        # Check for multilateral (Многосторонний)
        elif 'Многосторонний' in status_text or 'многосторонний' in status_text:
            return 2
    
    return None

def main():
    if not os.path.exists(input_path):
        print("Input file not found:", input_path)
        sys.exit(1)

    with open(input_path, 'r', encoding='utf-8') as f:
        geo = json.load(f)

    features = geo.get('features', [])
    name_keys = ['name','Name','NAME','title','label']

    modified = 0
    status_extracted = 0
    for feat in features:
        props = feat.get('properties', {}) or {}
        applied = False
        for nk in name_keys:
            if nk in props and isinstance(props[nk], str) and props[nk].strip():
                old = props[nk]
                props[nk] = transliterate(old)
                modified += 1
                applied = True
        # fallback: if no name-like key, use 'description' / 'desc' to create a 'name' property
        if not applied:
            for fk in ['description','desc']:
                if fk in props and isinstance(props[fk], str) and props[fk].strip():
                    props['name'] = transliterate(props[fk])
                    modified += 1
                    break
        
        # Extract status from description and add as a new property
        description = props.get('description', '') or props.get('desc', '')
        if description:
            status_value = extract_status(description)
            if status_value is not None:
                props['status'] = status_value
                status_extracted += 1
        
        feat['properties'] = props

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(geo, f, ensure_ascii=False, indent=2)

    print(f"Done. Wrote {output_path}")
    print(f"  - Processed {len(features)} features")
    print(f"  - Updated {modified} name fields")
    print(f"  - Extracted {status_extracted} status values")

if __name__ == "__main__":
    main()
