const fs = require('fs');
const Inventory = require('../models/inventory');
const env = require('./environment');
const pdf = require('pdf-creator-node');

const PDFDocument = require('pdfkit');

class PDFDocumentWithTables extends PDFDocument {
    constructor(options) {
        super(options);
    }

    table(table, arg0, arg1, arg2) {
        let startX = this.page.margins.left, startY = this.y;
        let options = {};

        if ((typeof arg0 === 'number') && (typeof arg1 === 'number')) {
            startX = arg0;
            startY = arg1;

            if (typeof arg2 === 'object')
                options = arg2;
        } else if (typeof arg0 === 'object') {
            options = arg0;
        }

        const columnCount = table.headers.length;
        const columnSpacing = options.columnSpacing || 15;
        const rowSpacing = options.rowSpacing || 5;
        const usableWidth = options.width || (this.page.width - this.page.margins.left - this.page.margins.right);

        const prepareHeader = options.prepareHeader || (() => { });
        const prepareRow = options.prepareRow || (() => { });
        const computeRowHeight = (row) => {
            let result = 0;

            row.forEach((cell) => {
                const cellHeight = this.heightOfString(cell, {
                    width: columnWidth,
                    align: 'left'
                });
                result = Math.max(result, cellHeight);
            });

            return result + rowSpacing;
        };

        const columnContainerWidth = usableWidth / columnCount;
        const columnWidth = columnContainerWidth - columnSpacing;
        const maxY = this.page.height - this.page.margins.bottom;

        let rowBottomY = 0;

        this.on('pageAdded', () => {
            startY = this.page.margins.top;
            rowBottomY = 0;
        });

        // Allow the user to override style for headers
        prepareHeader();

        // Check to have enough room for header and first rows
        if (startY + 3 * computeRowHeight(table.headers) > maxY)
            this.addPage();

        // Print all headers
        table.headers.forEach((header, i) => {
            this.font("Courier-Bold").fontSize(10).text(header, startX + i * columnContainerWidth, startY, {
                width: columnWidth,
                align: 'left'
            });
        });

        // Refresh the y coordinate of the bottom of the headers row
        rowBottomY = Math.max(startY + computeRowHeight(table.headers), rowBottomY);

        // Separation line between headers and rows
        this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
            .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
            .lineWidth(2)
            .stroke();

        table.rows.forEach((row, i) => {
            const rowHeight = computeRowHeight(row);

            // Switch to next page if we cannot go any further because the space is over.
            // For safety, consider 3 rows margin instead of just one
            if (startY + 3 * rowHeight < maxY)
                startY = rowBottomY + rowSpacing;
            else
                this.addPage();

            // Allow the user to override style for rows
            prepareRow(row, i);

            // Print all cells of the current row
            row.forEach((cell, i) => {
                this.text(cell, startX + i * columnContainerWidth, startY, {
                    width: columnWidth,
                    align: 'left'
                });
            });

            // Refresh the y coordinate of the bottom of this row
            rowBottomY = Math.max(startY + rowHeight, rowBottomY);

            // Separation line between rows
            this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
                .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
                .lineWidth(1)
                .opacity(0.7)
                .stroke()
                .opacity(1); // Reset opacity after drawing the line
        });

        this.x = startX;
        this.moveDown();

        return this;
    }
}


async function createSellInfoPDF(info) {

    const pdfFilePath = `sell_info_${info.userid}.pdf`;
    const doc = new PDFDocumentWithTables();
    doc.pipe(fs.createWriteStream(pdfFilePath));
    doc
        .fontSize(20)
        .text(`${env.hospital_name}`, 100, 15, { align: "center" })
        .text("Customer Invoice", 100, 35, { align: "center" })
        .fontSize(10)
        .text(`Name: ${info.name}`, 50, 65, { align: "left" })
        .text(`Mobile: ${info.mobile}`, 50, 75, { align: "left" })
        .text(`Email: ${info.email}`, 50, 85, { align: "left" })
        .text(`Address: ${info.address}`, 50, 95, { align: "left" })
        .text(`Prescribed By:${info.doctor}`, 50, 105, { align: "left" })
        .text(`Sell By:${info.staff}`, 50, 115, { align: "left" })
        .text(`Payment Mode:${info.payment}`, 50, 125, { align: "left" })
        .fontSize(10)
        .text(`${env.hospital_address}`, 200, 65, { align: "right" })
        .text(`${env.hospital_mobile}`, 200, 75, { align: "right" })
        .text(`${env.hospital_email}`, 200, 85, { align: "right" })
        .text(`${env.website}, `, 200, 95, { align: "right" })
        .text(`Gst: ${env.gst_number}`, 200, 105, { align: "right" })
        .moveDown();

    const table = {
        headers: ['Sno.', 'M-ID', 'Name', 'Unit', 'Cost(Rs.)', 'Discount(%)', 'GST(%)', 'Amount(Rs.)'],
        rows: []
    };
    let x = 1;
    let totalAmount = 0;
    for (let i = 0; i < info.medicineIds.length; i++) {
        const data = await Inventory.findOne({ medicine_id: info.medicineIds[i] });

        if (data) {
            const costEach = data.price;
            const unit = info.stocks[i];
            let discount = data.discount / 100;
            discount = parseFloat(discount.toFixed(2))
            let gst = data.gst / 100;
            gst = parseFloat(gst.toFixed(2))
            let amount = costEach * unit;
            let amt = amount;
            if (discount > 0) {
                amt -= amount * discount;
            }
            if (gst > 0) {
                amt += amount * gst;
            }
            amount = amt;
            // Round off amount to two decimal places
            const roundedAmount = parseFloat(amount.toFixed(2));
            table.rows.push([x, data.medicine_id, data.name, unit.toString(), costEach.toString(), data.discount, data.gst, roundedAmount.toString()])

            totalAmount += amount;
            x++;
        }
    }
    doc.moveDown().table(table, 10, 150, { width: 590 });
    doc.moveTo(10, 135 + table.rows.length * 20 + 50).lineTo(600, 135 + table.rows.length * 20 + 50).stroke();
    const roundedTotalAmount = parseFloat(totalAmount.toFixed(2));
    doc.fontSize(14).text(`Grand Total: Rs. ${roundedTotalAmount}`, 50, 135 + table.rows.length * 20 + 80, { align: "right" });
    doc.end();
}



// async function createSellInfoPDF(info) {
//     const pdfFilePath = `sell_info_${info.userid}.pdf`;
//     const doc = new PDFDocument();

//     // Pipe the PDF content to a writable stream
//     const pdfStream = fs.createWriteStream(pdfFilePath);
//     doc.pipe(pdfStream);

//     // Set the title with "BILL"
//     doc
//         .font('Helvetica-Bold')
//         .fontSize(16)
//         .text('SHIPRASH - BILL', { align: 'center' });

//     // Display the buyer's information
//     doc
//         .fontSize(12)
//         .moveDown()
//         .text(`Name: ${info.name}`)
//         .text(`Mobile Number: ${info.mobile}`)
//         .text(`Email: ${info.email}`)
//         .text(`Address: ${info.address}`)
//         .text(`Prescribed By: ${info.doctor}`)
//         .text(`Sell By: ${info.staff}`)
//         .text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`)
//         .text(`Payment Mode: ${info.payment}`);

//     // Define the table headers
//     const tableHeaders = ['Sno.', 'Medicine ID', 'Name', 'Unit', 'Cost Each', 'Discount', 'GST', 'Amount'];

//     // Initialize positions and row height for the table
//     const tableY = 250; // Adjust the Y position to leave space for the title and buyer info
//     const rowHeight = 30;

//     // Draw table headers with a border
//     doc.font('Helvetica-Bold').fontSize(12);
//     for (let i = 0; i < tableHeaders.length; i++) {
//         doc.text(tableHeaders[i], 50 + i * 100, tableY);
//     }

//     // Draw table grid lines and data
//     const startX = 50;
//     const endX = 750;
//     const startY = tableY - rowHeight;
//     const endY = tableY + (info.medicineIds.length + 2) * rowHeight;

//     for (let i = 0; i <= info.medicineIds.length + 2; i++) {
//         doc.moveTo(startX, startY + i * rowHeight).lineTo(endX, startY + i * rowHeight).stroke();
//     }

//     for (let i = 0; i <= tableHeaders.length; i++) {
//         doc.moveTo(startX + i * 100, startY).lineTo(startX + i * 100, endY).stroke();
//     }

//     // Initialize total amount
//     let totalAmount = 0;

//     // Draw table rows with SellInfo data
//     for (let i = 0; i < info.medicineIds.length; i++) {
//         const data = await Inventory.findOne({ medicine_id: info.medicineIds[i] });

//         if (data) {
//             const y = tableY + (i + 1) * rowHeight;

//             const costEach = data.price;
//             const unit = info.stocks[i];
//             const discount = data.discount / 100;
//             const gst = data.gst / 100;
//             let amount = costEach * unit;

//             if (discount > 0) {
//                 amount -= amount * discount;
//             }
//             if (gst > 0) {
//                 amount += amount * gst;
//             }

//             // Round off amount to two decimal places
//             const roundedAmount = parseFloat(amount.toFixed(2));

//             doc.font('Helvetica').fontSize(12);
//             doc.text((i + 1).toString(), 50, y);
//             doc.text(data.medicine_id, 150, y);
//             doc.text(data.name, 250, y);
//             doc.text(unit.toString(), 350, y);
//             doc.text(costEach.toString(), 450, y);
//             doc.text((discount * 100).toString(), 550, y);
//             doc.text((gst * 100).toString(), 650, y);
//             doc.text(roundedAmount.toString(), 750, y);

//             totalAmount += amount;
//         }
//     }

//     const roundedTotalAmount = parseFloat(totalAmount.toFixed(2));

//     // Draw Grand Total row
//     doc.font('Helvetica-Bold').fontSize(12);
//     doc.moveTo(50, tableY + (info.medicineIds.length + 1) * rowHeight)
//         .lineTo(750, tableY + (info.medicineIds.length + 1) * rowHeight).stroke();

//     doc.fontSize(14).text(`Grand Total: Rs. ${roundedTotalAmount}`, 50, tableY + (info.medicineIds.length + 2) * rowHeight + 20);

//     // Finalize the PDF
//     doc.end();
//     return pdfFilePath;
// }


module.exports = createSellInfoPDF;