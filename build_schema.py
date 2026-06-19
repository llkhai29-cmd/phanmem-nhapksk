import os
import pandas as pd
import json
import re

directory = r'd:\Phanmem_nhapksk'
output_file = os.path.join(directory, 'webapp', 'src', 'schema.json')

schemas = {}
md_content = "# Danh sách đầy đủ và phân cấp các cột theo từng đối tượng/độ tuổi\n\n"

def is_valid_node(val):
    val = str(val).strip()
    if not val: return False
    if val.lower() == 'nan': return False
    if 'unnamed:' in val.lower(): return False
    if val.upper() == 'STT': return False
    return True

for filename in sorted(os.listdir(directory)):
    if filename.endswith('.xlsx') and not filename.startswith('~'):
        filepath = os.path.join(directory, filename)
        try:
            xls = pd.ExcelFile(filepath)
            sheet_name = xls.sheet_names[0]
            df_temp = pd.read_excel(xls, sheet_name=sheet_name, header=None, nrows=10)
            
            # Find the index row (usually contains 1, 2, 3, 4...)
            index_row = -1
            for i in range(len(df_temp)):
                row_vals = df_temp.iloc[i].astype(str).str.strip().tolist()
                # Check if row contains '1' and '2' and '3'
                if '1' in row_vals and '2' in row_vals and '3' in row_vals:
                    index_row = i
                    break
            
            if index_row <= 0:
                index_row = 4
                
            # Read with MultiIndex header
            df = pd.read_excel(xls, sheet_name=sheet_name, header=list(range(index_row)), nrows=1)
            
            hierarchy = {}
            for col in df.columns:
                # col is a tuple of header levels
                path = []
                for level_val in col:
                    if is_valid_node(level_val):
                        # clean up string
                        val = str(level_val).replace('\n', ' ').strip()
                        # Avoid duplicating the same name consecutively in the path
                        if not path or path[-1] != val:
                            path.append(val)
                
                if not path:
                    continue
                    
                current_level = hierarchy
                for p in path:
                    if p not in current_level:
                        current_level[p] = {}
                    current_level = current_level[p]
            
            # Clean up root level: if there is a root like "THEO DÕI QUẢN LÝ...", we might want to skip it if it has only 1 child
            # But let's just keep the raw hierarchy for accuracy
            group_name = filename.replace('.xlsx', '')
            schemas[group_name] = hierarchy
            
            md_content += f"## 📄 {filename}\n"
            md_content += f"**Sheet:** {sheet_name}\n\n"
            
            def print_tree(tree_node, indent=0):
                res = ""
                for key, subtree in tree_node.items():
                    if not subtree:
                        res += "  " * indent + f"- {key}\n"
                    else:
                        res += "  " * indent + f"- **{key}**\n"
                        res += print_tree(subtree, indent + 1)
                return res
            
            md_content += print_tree(hierarchy)
            md_content += "\n---\n"
            
        except Exception as e:
            print(f"Error processing {filename}: {e}")

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(schemas, f, ensure_ascii=False, indent=2)

with open(os.path.join(directory, 'danh_sach_cot_day_du_v2.md'), 'w', encoding='utf-8') as f:
    f.write(md_content)

print("Created schema.json using MultiIndex.")
