import pandas as pd
import json

filepath = r'd:\Phanmem_nhapksk\từ 6 đến dưới 18.xlsx'
df = pd.read_excel(filepath, header=None, nrows=10)

index_row = -1
for i in range(len(df)):
    row_vals = df.iloc[i].astype(str).str.strip().tolist()
    if '1' in row_vals and '2' in row_vals and '3' in row_vals:
        index_row = i
        break

print(f"Index row: {index_row}")

# Now read again using MultiIndex
if index_row > 0:
    df_multi = pd.read_excel(filepath, header=list(range(index_row)), nrows=1)
    
    # Let's print the MultiIndex columns
    for col in df_multi.columns:
        print(col)
