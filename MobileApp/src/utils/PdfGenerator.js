import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const generateReportPDF = async (title, data, userInfo) => {
  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #1e293b; background-color: #fff; }
          .header { text-align: center; border-bottom: 3px solid #1b5e20; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #1b5e20; margin: 0; font-size: 28px; text-transform: uppercase; }
          .header p { margin: 5px 0 0; color: #64748b; font-size: 14px; }
          
          .report-info { background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
          .report-info p { margin: 8px 0; font-size: 14px; }
          .report-info strong { color: #334155; width: 120px; display: inline-block; }
          
          .title-section { margin-bottom: 30px; }
          .title-section h2 { font-size: 22px; color: #1e293b; border-left: 5px solid #1b5e20; padding-left: 15px; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #1b5e20; color: white; text-align: left; padding: 12px; font-size: 14px; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #475569; }
          tr:nth-child(even) { background-color: #f1f5f9; }
          
          .content { margin-top: 30px; line-height: 1.6; color: #334155; }
          
          .footer { margin-top: 60px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>AgroLanka Official Report</h1>
          <p>Ministry of Agriculture - Agrarian Service Center Management</p>
        </div>

        <div class="report-info">
          <p><strong>Report ID:</strong> AL-${Math.floor(1000 + Math.random() * 9000)}</p>
          <p><strong>Center:</strong> ${userInfo?.assignedAsc?.name || 'N/A'}</p>
          <p><strong>District:</strong> ${userInfo?.assignedAsc?.district || 'N/A'}</p>
          <p><strong>Issued By:</strong> ${userInfo?.name} (Officer)</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>

        <div class="title-section">
          <h2>${title}</h2>
        </div>

        ${data.type === 'crop_stats' ? `
          <table>
            <thead>
              <tr>
                <th>Crop Category</th>
                <th>Count</th>
                <th>Total Land (Acres)</th>
              </tr>
            </thead>
            <tbody>
              ${data.rows.map(row => `
                <tr>
                  <td>${row.category}</td>
                  <td>${row.count}</td>
                  <td>${row.landSize.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `
          <div class="content">
            <p>${data.content || 'No data provided.'}</p>
          </div>
        `}

        <div class="footer">
          <p>This report was generated using the AgroLanka Mobile Application.</p>
          <p>Confidentiality Notice: This document is intended for official government use only.</p>
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    console.log('PDF generated at:', uri);
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    return uri;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
