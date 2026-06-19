import os
import pandas as pd
import json

directory = r'd:\Phanmem_nhapksk'
results = {}

for filename in os.listdir(directory):
    if filename.endswith('.xlsx'):
        filepath = os.path.join(directory, filename)
        try:
            # Read all sheets
            xls = pd.ExcelFile(filepath)
            sheet_data = {}
            for sheet_name in xls.sheet_names:
                df = pd.read_excel(xls, sheet_name=sheet_name, nrows=5)
                # Convert to string to avoid json serialization issues with NaN, dates, etc
                sheet_data[sheet_name] = {
                    'columns': list(df.columns.astype(str)),
                    'sample_data': df.astype(str).to_dict(orient='records')
                }
            results[filename] = sheet_data
        except Exception as e:
            results[filename] = str(e)

with open(os.path.join(directory, 'excel_info.json'), 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=4)
print("Done")
