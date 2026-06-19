import os
import pandas as pd

directory = r'd:\Phanmem_nhapksk'
output_file = os.path.join(directory, 'danh_sach_cot.md')

md_content = "# Danh sách chi tiết các cột của từng đối tượng/độ tuổi\n\n"

for filename in sorted(os.listdir(directory)):
    if filename.endswith('.xlsx'):
        filepath = os.path.join(directory, filename)
        try:
            # Dùng header=[0,1,2] để lấy 3 dòng đầu làm tiêu đề đa cấp (MultiIndex)
            df = pd.read_excel(filepath, header=[0, 1, 2], nrows=0)
            
            md_content += f"## File: {filename}\n"
            for sheet_name in df.columns.names:
                pass # just to check
            
            # Đọc từng sheet để lấy MultiIndex
            xls = pd.ExcelFile(filepath)
            for sheet_name in xls.sheet_names:
                df_sheet = pd.read_excel(xls, sheet_name=sheet_name, header=[0, 1, 2], nrows=0)
                md_content += f"### Sheet: {sheet_name}\n"
                md_content += "| Cấp 1 (Nhóm chính) | Cấp 2 (Nhóm phụ) | Cấp 3 (Cột chi tiết) |\n"
                md_content += "|---|---|---|\n"
                
                for col in df_sheet.columns:
                    c1 = str(col[0]).strip() if not pd.isna(col[0]) and "Unnamed" not in str(col[0]) else ""
                    c2 = str(col[1]).strip() if not pd.isna(col[1]) and "Unnamed" not in str(col[1]) else ""
                    c3 = str(col[2]).strip() if not pd.isna(col[2]) and "Unnamed" not in str(col[2]) else ""
                    
                    # Dọn dẹp các ký tự newline
                    c1 = c1.replace('\n', ' ')
                    c2 = c2.replace('\n', ' ')
                    c3 = c3.replace('\n', ' ')
                    
                    md_content += f"| {c1} | {c2} | {c3} |\n"
            md_content += "\n---\n"
        except Exception as e:
            md_content += f"Lỗi khi đọc file {filename}: {str(e)}\n\n"

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(md_content)
    
print("Done extracting to", output_file)
