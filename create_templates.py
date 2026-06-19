import json
import pandas as pd
import os

# Load schema
schema_path = r'd:\Phanmem_nhapksk\webapp\src\schema.json'
with open(schema_path, 'r', encoding='utf-8') as f:
    schema = json.load(f)

# Output directory
output_dir = r'd:\Phanmem_nhapksk\Templates'
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

def get_fields(obj):
    fields = []
    for key, value in obj.items():
        if not value:  # Empty dictionary
            fields.append(key)
        else:
            fields.extend(get_fields(value))
    return fields

for group_name, group_data in schema.items():
    # Extract all flat fields for this group
    fields = get_fields(group_data)
    
    # Create an empty dataframe with these fields as columns
    df = pd.DataFrame(columns=fields)
    
    # Save to Excel
    # Make sure to handle potential special characters in filename if needed, but group names are fine.
    # Group names: 'từ 0 đến dưới 6 tuổi', 'từ 6 đến dưới 18', 'từ đủ 18 đén dưới 60', 'từ 60 tuổi trỡ lên', 'Người lái xe'
    file_path = os.path.join(output_dir, f"{group_name}.xlsx")
    
    # We can add a sample row (optional) to show how it should be filled, or just leave it empty.
    # Just leaving it empty with headers is standard for templates.
    df.to_excel(file_path, index=False)
    
    print(f"Created template successfully")

print("All templates generated successfully.")
