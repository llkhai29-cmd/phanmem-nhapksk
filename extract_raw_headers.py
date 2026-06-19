import os
import pandas as pd
import json

directory = r'd:\Phanmem_nhapksk'
results = {}

for filename in sorted(os.listdir(directory)):
    if filename.endswith('.xlsx'):
        filepath = os.path.join(directory, filename)
        try:
            xls = pd.ExcelFile(filepath)
            sheet_name = xls.sheet_names[0]
            # Read first 5 rows without headers
            df = pd.read_excel(xls, sheet_name=sheet_name, header=None, nrows=6)
            
            # Fill NaN with empty string
            df = df.fillna("")
            
            # Convert to list of lists
            rows = df.values.tolist()
            results[filename] = rows
            
        except Exception as e:
            results[filename] = str(e)

with open(os.path.join(directory, 'raw_headers.json'), 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Done extracting raw headers.")
