import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import schemaData from './schema.json';
import './index.css';

const getFields = (obj, path = []) => {
  let fields = [];
  for (const [key, value] of Object.entries(obj)) {
    if (Object.keys(value).length === 0) {
      fields.push({ name: key, path: [...path, key] });
    } else {
      fields = [...fields, ...getFields(value, [...path, key])];
    }
  }
  return fields;
};

function App() {
  const [selectedGroup, setSelectedGroup] = useState(Object.keys(schemaData)[0] || "");
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({});
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [showDataGrid, setShowDataGrid] = useState(true);

  const schema = schemaData[selectedGroup] || {};
  const tabs = Object.keys(schema);
  const currentTabName = tabs[activeTab];
  const currentTabContent = currentTabName ? schema[currentTabName] : {};
  
  const allFields = useMemo(() => getFields(schema), [schema]);

  const handleInputChange = (fieldPath, value) => {
    const fieldKey = fieldPath.join('||');
    setFormData(prev => ({ ...prev, [fieldKey]: value }));
  };

  const handleSave = () => {
    if (Object.keys(formData).length === 0) return;
    setRecords([...records, { id: Date.now(), ...formData }]);
    setFormData({});
    setSelectedRecordId(null);
  };

  const handleUpdate = () => {
    if (!selectedRecordId) {
      alert("Vui lòng chọn một dòng để cập nhật!");
      return;
    }
    setRecords(records.map(rec => rec.id === selectedRecordId ? { ...formData, id: selectedRecordId } : rec));
    alert("Đã cập nhật dòng chọn thành công!");
  };

  const handleDelete = () => {
    if (!selectedRecordId) {
      alert("Vui lòng chọn một dòng để xóa!");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa dòng này không?")) {
      setRecords(records.filter(rec => rec.id !== selectedRecordId));
      if (formData.id === selectedRecordId) setFormData({});
      setSelectedRecordId(null);
    }
  };

  const handleNew = () => {
    setFormData({});
    setSelectedRecordId(null);
  };

  const handleBackup = () => {
    if (records.length === 0) {
      alert("Không có dữ liệu để sao lưu!");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${selectedGroup}_backup.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (Array.isArray(json)) {
          setRecords(json);
          alert("Nạp sao lưu thành công!");
        } else {
          alert("File sao lưu không hợp lệ!");
        }
      } catch(err) {
        alert("Lỗi đọc file sao lưu!");
      }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, {header: 1});
        
        if (json.length < 2) return;
        const headers = json[0];
        const importedRecords = [];
        
        for (let i = 1; i < json.length; i++) {
          const row = json[i];
          if (row.length === 0) continue;
          const rec = { id: Date.now() + i };
          headers.forEach((h, idx) => {
            const field = allFields.find(f => f.name === h);
            if (field && row[idx] !== undefined && row[idx] !== null) {
                rec[field.path.join('||')] = row[idx];
            }
          });
          importedRecords.push(rec);
        }
        setRecords(prev => [...prev, ...importedRecords]);
        alert(`Nhập thành công ${importedRecords.length} dòng từ Excel!`);
      } catch (err) {
        alert("Lỗi khi import file Excel!");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };

  const exportExcel = () => {
    const ws_data = [];
    const headers = allFields.map(f => f.name);
    ws_data.push(headers);
    records.forEach(rec => {
      const row = allFields.map(f => rec[f.path.join('||')] || "");
      ws_data.push(row);
    });
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSach");
    XLSX.writeFile(wb, `${selectedGroup}_Export.xlsx`);
  };

  const handlePrintReport = () => {
    let dataToPrint = formData;
    
    // Nếu form hiện tại trống nhưng đang chọn một dòng ở dưới, lấy dữ liệu dòng đó
    if (Object.keys(dataToPrint).length === 0 && selectedRecordId) {
      const rec = records.find(r => r.id === selectedRecordId);
      if (rec) {
        dataToPrint = rec;
      }
    }
    
    if (!dataToPrint || Object.keys(dataToPrint).length === 0) {
      alert("Vui lòng chọn hoặc điền thông tin bản ghi để in báo cáo!");
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) {
      alert("Không thể mở cửa sổ in. Vui lòng cho phép trình duyệt mở popup!");
      return;
    }
    
    // Nhóm các trường theo Tab và Section
    const groupedData = {};
    allFields.forEach(f => {
      const [tab, ...rest] = f.path;
      const val = dataToPrint[f.path.join('||')] || "";
      if (!groupedData[tab]) {
        groupedData[tab] = [];
      }
      groupedData[tab].push({ name: f.name, value: val, path: rest });
    });

    let sectionsHtml = "";
    Object.entries(groupedData).forEach(([tabName, fields]) => {
      sectionsHtml += `
        <div class="print-section">
          <h3>${tabName}</h3>
          <div class="print-grid">
            ${fields.map(f => `
              <div class="print-item">
                <span class="print-label">${f.path.length > 0 ? f.path.join(' - ') + ': ' : ''}${f.name}:</span>
                <span class="print-value">${f.value || '................................'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Phiếu Khám Sức Khỏe - ${selectedGroup}</title>
        <style>
          @media print {
            @page { size: A4; margin: 15mm; }
            body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.4; color: #000; background: #fff; }
            .no-print { display: none; }
          }
          body {
            font-family: "Times New Roman", Times, serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            color: #000;
            background: #fff;
          }
          .header-table {
            width: 100%;
            margin-bottom: 20px;
            border: none;
          }
          .header-table td {
            border: none;
            vertical-align: top;
            text-align: center;
          }
          .header-title {
            font-weight: bold;
            text-transform: uppercase;
          }
          .title-section {
            text-align: center;
            margin: 20px 0;
          }
          .title-section h2 {
            margin: 0;
            font-size: 16pt;
            font-weight: bold;
            text-transform: uppercase;
          }
          .title-section p {
            margin: 5px 0 0 0;
            font-style: italic;
          }
          .print-section {
            margin-top: 15px;
            page-break-inside: avoid;
          }
          .print-section h3 {
            margin: 5px 0;
            font-size: 13pt;
            border-bottom: 1.5px solid #000;
            padding-bottom: 2px;
            text-transform: uppercase;
            font-weight: bold;
          }
          .print-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px 15px;
            margin-top: 5px;
          }
          .print-item {
            font-size: 11pt;
            display: flex;
            align-items: baseline;
          }
          .print-label {
            font-weight: bold;
            margin-right: 5px;
            white-space: nowrap;
          }
          .print-value {
            border-bottom: 1px dotted #000;
            flex-grow: 1;
            padding-left: 3px;
            word-break: break-all;
          }
          .footer-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .footer-col {
            text-align: center;
            width: 45%;
          }
          .footer-col .signature-space {
            margin-top: 70px;
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 45%">
              <div class="header-title" style="font-size: 11pt;">SỞ Y TẾ TỈNH/THÀNH PHỐ</div>
              <div style="font-weight: bold; font-size: 11pt;">CƠ SỞ KHÁM CHỮA BỆNH</div>
              <div>***</div>
            </td>
            <td style="width: 55%">
              <div class="header-title" style="font-size: 11pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div style="font-weight: bold; text-decoration: underline; font-size: 10pt;">Độc lập - Tự do - Hạnh phúc</div>
            </td>
          </tr>
        </table>

        <div class="title-section">
          <h2>PHIẾU KHÁM SỨC KHỎE</h2>
          <p>Đối tượng: <strong>${selectedGroup}</strong></p>
        </div>

        ${sectionsHtml}

        <div class="footer-section">
          <div class="footer-col">
            <div style="font-style: italic;">..., ngày ... tháng ... năm 20...</div>
            <div style="font-weight: bold; margin-top: 5px; font-size: 11pt;">NGƯỜI ĐƯỢC KHÁM KÝ TÊN</div>
            <div style="font-size: 9pt; color: #555;">(Ký và ghi rõ họ tên)</div>
            <div class="signature-space"></div>
          </div>
          <div class="footer-col">
            <div style="font-style: italic;">..., ngày ... tháng ... năm 20...</div>
            <div style="font-weight: bold; margin-top: 5px; font-size: 11pt;">BÁC SĨ KẾT LUẬN</div>
            <div style="font-size: 9pt; color: #555;">(Ký, ghi rõ họ tên và đóng dấu)</div>
            <div class="signature-space"></div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const loadRecordToForm = (rec) => {
    setFormData(rec);
    setSelectedRecordId(rec.id);
  };

  const handleLoadSelectedToForm = () => {
    const rec = records.find(r => r.id === selectedRecordId);
    if (rec) {
      loadRecordToForm(rec);
    } else {
      alert("Vui lòng chọn một dòng ở bảng dưới!");
    }
  };

  const renderSection = (sectionName, content, path) => {
    if (!content || Object.keys(content).length === 0) {
      const type = (sectionName.toLowerCase().includes('ngày') || sectionName.toLowerCase().includes('date')) ? "date" : "text";
      const fieldKey = [...path, sectionName].join('||');
      return (
        <div className="form-row" key={fieldKey}>
          <label className="form-label text-label-md text-on-surface-variant" title={sectionName}>{sectionName}</label>
          <input 
            className="input-standard"
            type={type} 
            value={formData[fieldKey] || ""} 
            onChange={(e) => handleInputChange([...path, sectionName], e.target.value)}
          />
        </div>
      );
    }

    const sectionFields = getFields(content, [...path, sectionName]);
    const halfway = Math.ceil(sectionFields.length / 2);
    const col1 = sectionFields.slice(0, halfway);
    const col2 = sectionFields.slice(halfway);
    
    const renderField = (f) => {
      const intermediate = f.path.slice(path.length + 1, -1);
      const labelText = intermediate.length > 0 ? `${intermediate.join(' - ')}: ${f.name}` : f.name;
      const fieldKey = f.path.join('||');
      const type = (f.name.toLowerCase().includes('ngày') || f.name.toLowerCase().includes('date')) ? "date" : "text";

      return (
        <div className="form-row" key={fieldKey}>
          <label className="form-label text-label-md text-on-surface-variant" title={labelText}>{labelText}</label>
          <input 
            className="input-standard"
            type={type} 
            value={formData[fieldKey] || ""} 
            onChange={(e) => handleInputChange(f.path, e.target.value)}
          />
        </div>
      );
    };

    return (
      <div className="max-w-container-max mx-auto bg-white border border-outline-variant rounded-lg p-6 shadow-sm mb-6" key={sectionName}>
        {sectionName !== currentTabName && (
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-outline-variant">
            <span className="material-symbols-outlined text-primary">feed</span>
            <h2 className="text-headline-sm font-bold text-on-surface">{sectionName}</h2>
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-1">
          <div className="space-y-1">
            {col1.map(renderField)}
          </div>
          <div className="space-y-1">
            {col2.map(renderField)}
          </div>
        </div>
      </div>
    );
  };

  const filteredRecords = records.filter(rec => {
    if (!searchQuery) return true;
    return Object.values(rec).some(v => String(v).toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="app-container text-on-surface bg-background">
      <header className="flex flex-col shrink-0 border-b border-outline-variant bg-surface-container-highest z-50">
        <div className="h-10 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>medical_services</span>
                <h1 className="text-headline-sm font-bold text-primary tracking-tight">Nhập liệu KSK Cộng Đồng</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline">account_circle</span>
                    <span className="text-label-md">BS. Nguyễn Văn A</span>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-surface-container-high rounded"><span className="material-symbols-outlined">settings</span></button>
                    <button className="p-1 hover:bg-surface-container-high rounded"><span className="material-symbols-outlined">help</span></button>
                </div>
            </div>
        </div>

        <div className="h-12 px-4 border-t border-outline-variant flex items-center gap-4 bg-surface-container-low">
            <div className="flex items-center gap-2 flex-1">
                <span className="text-label-md whitespace-nowrap">File mẫu Excel:</span>
                <input className="input-standard bg-surface-variant/50 max-w-md cursor-default text-on-surface-variant italic" readOnly type="text" value={`C:\\Templates\\${selectedGroup}.xlsx`}/>
                <button className="btn-action bg-surface-container-high text-on-surface border border-outline-variant hover:bg-surface-dim" onClick={() => alert("Chức năng chọn mẫu đang phát triển")}>
                    <span className="material-symbols-outlined">folder_open</span>
                    Chọn mẫu
                </button>
            </div>
            <div className="flex items-center gap-2">
                <button className="btn-action bg-surface-container-high text-on-surface border border-outline-variant hover:bg-surface-dim" onClick={handleBackup}>
                    <span className="material-symbols-outlined">cloud_download</span>
                    Sao lưu danh sách
                </button>
                <label className="btn-action bg-surface-container-high text-on-surface border border-outline-variant hover:bg-surface-dim cursor-pointer m-0">
                    <span className="material-symbols-outlined">cloud_upload</span>
                    Nạp sao lưu
                    <input type="file" accept=".json" style={{display: 'none'}} onChange={handleRestore} />
                </label>
                <div className="w-px h-6 bg-outline-variant mx-1"></div>
                <label className="btn-action bg-secondary text-on-secondary hover:opacity-90 cursor-pointer m-0">
                    <span className="material-symbols-outlined">file_upload</span>
                    Import Excel
                    <input type="file" accept=".xlsx, .xls" style={{display: 'none'}} onChange={handleImportExcel} />
                </label>
            </div>
        </div>

        <div className="h-12 px-4 border-t border-outline-variant flex items-center justify-between bg-surface-container-low">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-label-md font-bold whitespace-nowrap">Nhóm đối tượng:</span>
                    <select 
                        className="input-standard w-48 py-0"
                        value={selectedGroup} 
                        onChange={(e) => {
                            setSelectedGroup(e.target.value);
                            setActiveTab(0);
                            setFormData({});
                            setRecords([]);
                            setSelectedRecordId(null);
                        }}
                    >
                        {Object.keys(schemaData).map(group => (
                            <option key={group} value={group}>{group}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-action bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container" onClick={handleSave}>
                        <span className="material-symbols-outlined">save</span> Lưu bản ghi
                    </button>
                    <button className="btn-action bg-white border border-primary text-primary hover:bg-primary-fixed" onClick={handleUpdate}>
                        <span className="material-symbols-outlined">edit</span> Cập nhật
                    </button>
                    <button className="btn-action bg-white border border-error text-error hover:bg-error-container" onClick={handleDelete}>
                        <span className="material-symbols-outlined">delete</span> Xóa
                    </button>
                    <button className="btn-action bg-white border border-outline-variant text-on-surface-variant hover:bg-surface-container-high" onClick={handleNew}>
                        <span className="material-symbols-outlined">add</span> Thêm mới
                    </button>
                    <button className="btn-action bg-white border border-outline-variant text-on-surface-variant hover:bg-surface-container-high" onClick={handleNew}>
                        <span className="material-symbols-outlined">restore</span> Mặc định
                    </button>
                    <button className="btn-action bg-white border border-outline-variant text-on-surface-variant hover:bg-surface-container-high" onClick={() => setShowDataGrid(!showDataGrid)}>
                        <span className="material-symbols-outlined">visibility_off</span> Ẩn/hiện ds
                    </button>
                </div>
            </div>
            <div className="flex gap-2">
                <button className="btn-action bg-secondary text-on-secondary hover:opacity-90" onClick={exportExcel}>
                    <span className="material-symbols-outlined">download</span> Xuất Excel
                </button>
                <button className="btn-action bg-primary text-on-primary hover:opacity-90" onClick={handlePrintReport}>
                    <span className="material-symbols-outlined">print</span> In báo cáo
                </button>
            </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
        <nav className="flex border-b border-outline-variant bg-white px-4 overflow-x-auto">
          {tabs.map((tab, idx) => (
            <button 
              key={idx} 
              className={`h-10 px-6 text-label-md transition-colors whitespace-nowrap ${
                  idx === activeTab 
                  ? 'border-b-2 border-primary text-primary font-bold' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
              }`}
              onClick={() => setActiveTab(idx)}
            >
              {tab}
            </button>
          ))}
        </nav>
        
        <div className="flex-1 overflow-y-auto p-6 bg-background">
          {currentTabContent && Object.keys(currentTabContent).length > 0 ? (() => {
            const leafNodes = [];
            const subSections = [];
            for (const [key, val] of Object.entries(currentTabContent)) {
              if (Object.keys(val).length === 0) leafNodes.push({key, val});
              else subSections.push({key, val});
            }

            return (
              <>
                {leafNodes.length > 0 && (
                  <div className="max-w-container-max mx-auto bg-white border border-outline-variant rounded-lg p-6 shadow-sm mb-6">
                    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-outline-variant">
                      <span className="material-symbols-outlined text-primary">feed</span>
                      <h2 className="text-headline-sm font-bold text-on-surface">{currentTabName}</h2>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-1">
                      <div className="space-y-1">
                        {leafNodes.slice(0, Math.ceil(leafNodes.length / 2)).map(node => renderSection(node.key, node.val, [currentTabName]))}
                      </div>
                      <div className="space-y-1">
                        {leafNodes.slice(Math.ceil(leafNodes.length / 2)).map(node => renderSection(node.key, node.val, [currentTabName]))}
                      </div>
                    </div>
                  </div>
                )}
                {subSections.map(node => renderSection(node.key, node.val, [currentTabName]))}
              </>
            );
          })() : (
            <div style={{color: 'var(--text-light)', textAlign: 'center', marginTop: '2rem'}}>Không có dữ liệu cho tab này</div>
          )}
        </div>
      </main>

      {showDataGrid && (
      <section className="h-[307px] border-t border-outline-variant bg-white flex flex-col shrink-0">
        <div className="h-10 px-4 flex items-center justify-between bg-surface-container-low border-b border-outline-variant">
            <div className="flex items-center gap-4">
                <span className="text-label-md font-bold text-on-surface uppercase tracking-tight">Danh sách bản ghi đã nhập</span>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                    <input 
                        className="input-standard pl-8 w-64 text-body-sm" 
                        placeholder="Tìm kiếm..." 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <button className="btn-action bg-primary-fixed-dim text-on-primary-fixed hover:bg-primary-fixed" onClick={handleLoadSelectedToForm}>
                <span className="material-symbols-outlined">keyboard_double_arrow_up</span>
                Nạp dòng vào form
            </button>
        </div>

        <div className="flex-1 overflow-auto relative">
            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="sticky top-0 bg-surface-container-high z-10">
                    <tr className="h-8 border-b border-outline-variant">
                        <th className="px-3 text-label-md border-r border-outline-variant w-12 text-center">STT</th>
                        {allFields.slice(0, 15).map((f, i) => (
                            <th key={i} className="px-3 text-label-md border-r border-outline-variant">{f.name}</th>
                        ))}
                        {allFields.length > 15 && <th className="px-3 text-label-md">...</th>}
                    </tr>
                </thead>
                <tbody className="text-body-sm">
                    {filteredRecords.map((rec, idx) => (
                        <tr 
                            key={rec.id}
                            onClick={() => setSelectedRecordId(rec.id)}
                            onDoubleClick={() => loadRecordToForm(rec)}
                            className={`h-8 border-b border-outline-variant hover:bg-surface-container-low cursor-pointer transition-colors ${selectedRecordId === rec.id ? 'bg-primary-fixed/20' : ''}`}
                        >
                            <td className="px-3 border-r border-outline-variant text-center font-data-mono">{idx + 1}</td>
                            {allFields.slice(0, 15).map((f, i) => (
                                <td key={i} className="px-3 border-r border-outline-variant">{rec[f.path.join('||')] || ""}</td>
                            ))}
                            {allFields.length > 15 && <td className="px-3">...</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        <footer className="h-8 px-4 flex items-center justify-between border-t border-outline-variant bg-surface-container-highest">
            <span className="text-label-sm text-on-surface-variant">
                Đang hiển thị {filteredRecords.length}/{records.length} bản ghi
            </span>
            <div className="flex gap-4">
                <span className="text-label-sm text-on-surface-variant">Nhóm: <span className="text-secondary font-bold">{selectedGroup}</span></span>
                <span className="text-label-sm text-on-surface-variant">Phiên bản: 2.4.0-release</span>
            </div>
        </footer>
      </section>
      )}
    </div>
  );
}

export default App;
