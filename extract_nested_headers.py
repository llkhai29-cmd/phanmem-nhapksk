import os
import pandas as pd
import json

directory = r'd:\Phanmem_nhapksk'
output_file = os.path.join(directory, 'danh_sach_cot_day_du.md')

md_content = "# Danh sách đầy đủ và phân cấp các cột theo từng đối tượng/độ tuổi\n\n"

for filename in sorted(os.listdir(directory)):
    if filename.endswith('.xlsx'):
        filepath = os.path.join(directory, filename)
        try:
            xls = pd.ExcelFile(filepath)
            for sheet_name in xls.sheet_names:
                # Read first 6 rows without header
                df = pd.read_excel(xls, sheet_name=sheet_name, header=None, nrows=6)
                
                # Find the row that contains "STT"
                stt_row_idx = -1
                for i in range(len(df)):
                    row_vals = df.iloc[i].astype(str).str.strip().tolist()
                    if "STT" in row_vals:
                        stt_row_idx = i
                        break
                
                if stt_row_idx == -1:
                    continue # Skip if no STT found
                
                # The headers are usually the STT row and the row(s) below it, or rows above it.
                # In Vietnam medical forms, the main categories are often 1 row above STT, and detailed questions 1-2 rows below STT.
                # Let's take from stt_row_idx - 1 to stt_row_idx + 2 as the header block.
                start_row = max(0, stt_row_idx - 1)
                end_row = min(len(df) - 1, stt_row_idx + 2)
                
                header_block = df.iloc[start_row:end_row+1].copy()
                
                # Forward fill horizontally for each row to handle merged cells
                header_block = header_block.ffill(axis=1)
                
                md_content += f"## 📄 {filename}\n"
                md_content += f"**Sheet:** {sheet_name}\n\n"
                
                # Build hierarchy
                hierarchy = {}
                for col_idx in range(len(df.columns)):
                    path = []
                    for row_idx in range(len(header_block)):
                        val = str(header_block.iloc[row_idx, col_idx]).strip()
                        if val and val != 'nan' and val != 'None':
                            val = val.replace('\n', ' ')
                            if not path or path[-1] != val: # avoid duplicate levels
                                path.append(val)
                    
                    if not path:
                        continue
                        
                    # Insert into hierarchy tree
                    current_level = hierarchy
                    for p in path:
                        if p not in current_level:
                            current_level[p] = {}
                        current_level = current_level[p]

                # Function to print tree
                def print_tree(tree_node, indent=0):
                    res = ""
                    for key, subtree in tree_node.items():
                        if not subtree:
                            res += "  " * indent + f"- {key}\n"
                        else:
                            # if it's a category with children
                            res += "  " * indent + f"- **{key}**\n"
                            res += print_tree(subtree, indent + 1)
                    return res
                
                md_content += print_tree(hierarchy)
                md_content += "\n---\n"
                
        except Exception as e:
            md_content += f"Lỗi khi đọc file {filename}: {str(e)}\n\n"

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(md_content)

print("Done extracting full nested headers.")
