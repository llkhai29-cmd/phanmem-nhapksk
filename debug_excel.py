import pandas as pd
import json

filepath = r'd:\Phanmem_nhapksk\từ 0 đên dưới 6 tuổi.xlsx'
df = pd.read_excel(filepath, header=None, nrows=10)

# Fill NaN with empty string
df = df.fillna("")

data = df.values.tolist()

with open(r'd:\Phanmem_nhapksk\debug_0_6.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Debug file created.")
