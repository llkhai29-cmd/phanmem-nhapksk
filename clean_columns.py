import json
import os

directory = r'd:\Phanmem_nhapksk'
input_file = os.path.join(directory, 'excel_info.json')
output_file = os.path.join(directory, 'danh_sach_cot_sach.md')

with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

md_content = "# Danh sách đầy đủ các cột nhập liệu cho từng đối tượng/độ tuổi\n\n"

for filename, sheets in data.items():
    if isinstance(sheets, dict):
        md_content += f"## 📄 {filename}\n"
        for sheet_name, sheet_data in sheets.items():
            if 'sample_data' in sheet_data and len(sheet_data['sample_data']) >= 3:
                row_3 = sheet_data['sample_data'][2] # Dòng 3 thường chứa tên cột chi tiết
                # Đôi khi có thể dòng 2
                row_2 = sheet_data['sample_data'][1]
                row_1 = sheet_data['sample_data'][0]
                
                columns_list = []
                for k, v in row_3.items():
                    val = str(v).strip()
                    if val != 'nan' and val != 'NaN' and val:
                        columns_list.append(val)
                    else:
                        # Thử lấy ở dòng 2 nếu dòng 3 trống
                        val2 = str(row_2.get(k, '')).strip()
                        if val2 != 'nan' and val2 != 'NaN' and val2:
                            columns_list.append(val2)
                
                md_content += f"**Sheet:** {sheet_name}\n\n"
                md_content += "Các cột chi tiết cần nhập liệu:\n"
                for i, col in enumerate(columns_list, 1):
                    md_content += f"{i}. {col}\n"
                md_content += "\n---\n"

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(md_content)

print("Done generating clean column list")
