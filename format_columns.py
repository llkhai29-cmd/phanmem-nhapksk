import os
import pandas as pd

directory = r'd:\Phanmem_nhapksk'
output_file = os.path.join(directory, 'danh_sach_cot_grouped.md')

md_content = "# Danh sách chi tiết các cột theo từng đối tượng/độ tuổi\n\n"

for filename in sorted(os.listdir(directory)):
    if filename.endswith('.xlsx'):
        filepath = os.path.join(directory, filename)
        try:
            md_content += f"## 📄 {filename}\n"
            
            xls = pd.ExcelFile(filepath)
            for sheet_name in xls.sheet_names:
                df_sheet = pd.read_excel(xls, sheet_name=sheet_name, header=[0, 1, 2], nrows=0)
                
                hierarchy = {}
                for col in df_sheet.columns:
                    c1 = str(col[0]).strip()
                    c2 = str(col[1]).strip()
                    c3 = str(col[2]).strip()
                    
                    # Dọn dẹp Unnamed và .1, .2
                    if pd.isna(col[0]) or "Unnamed" in c1: c1 = ""
                    else: c1 = c1.split('.')[0] if c1.endswith(('.1','.2','.3','.4','.5','.6','.7','.8','.9')) else c1
                    
                    if pd.isna(col[1]) or "Unnamed" in c2: c2 = ""
                    else: c2 = c2.split('.')[0] if c2.endswith(('.1','.2','.3','.4','.5','.6','.7','.8','.9')) else c2
                    
                    if pd.isna(col[2]) or "Unnamed" in c3: c3 = ""
                    else: c3 = c3.split('.')[0] if c3.endswith(('.1','.2','.3','.4','.5','.6','.7','.8','.9')) else c3
                    
                    c1 = c1.replace('\n', ' ')
                    c2 = c2.replace('\n', ' ')
                    c3 = c3.replace('\n', ' ')
                    
                    if c1 not in hierarchy:
                        hierarchy[c1] = {}
                    if c2 not in hierarchy[c1]:
                        hierarchy[c1][c2] = []
                    if c3 and c3 not in hierarchy[c1][c2]:
                        hierarchy[c1][c2].append(c3)
                
                for h1, h2_dict in hierarchy.items():
                    if h1:
                        md_content += f"### {h1}\n"
                    for h2, h3_list in h2_dict.items():
                        if h2:
                            md_content += f"- **{h2}**: "
                            if h3_list:
                                md_content += ", ".join(h3_list)
                            md_content += "\n"
                        else:
                            if h3_list:
                                md_content += "- " + ", ".join(h3_list) + "\n"
                md_content += "\n---\n"
        except Exception as e:
            md_content += f"Lỗi khi đọc file {filename}: {str(e)}\n\n"

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(md_content)
    
print("Done extracting grouped to", output_file)
