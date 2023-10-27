const Inventory = require('../models/inventory');
const SellInfo = require('../models/sell');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

module.exports.addInventory = async function (req, res) {
    try {
        const medicine = await Inventory.findOne({ medicine_id: req.body.medicine_id });
        if (!medicine) {
            await Inventory.create(req.body);
            req.flash('success', 'Medicine Added to inventory!!');
            return res.redirect("/admin/profile");
        } else {
            req.flash('error', 'Medicine already exists');
            throw new Error("Medicine already exists");
        }
    } catch (err) {
        console.log("Error in Adding medicine to inventory", err);
        return res.redirect("back");
    }
}

module.exports.destroyinventory = async function (req, res) {
    try {
        const inventory = await Inventory.findById(req.params.id);
        if (inventory) {
            inventory.deleteOne();
            req.flash('success', 'Deleted Successfully!!');
            res.redirect('back');
        }
        else {
            req.flash('error', 'No data found to delete!!')
            return res.redirect('back');
        }
    } catch (err) {
        req.flash('error', err)
        return res.redirect('back');
    }
}
module.exports.removeinventory = async function (req, res) {
    try {
        const medicineIds = req.body.medicine_id;
        const stocks = req.body.stock;

        for (let i = 0; i < medicineIds.length; i++) {
            const data = await Inventory.findOne({ medicine_id: medicineIds[i] });
            if (data) {
                if (data.stock >= stocks[i]) {
                    data.stock -= stocks[i];
                    const money = data.price * stocks[i];

                    // Create a SellInfo record for each item
                    await SellInfo.create({
                        medicine_id: medicineIds[i],
                        name: data.name,
                        unit: stocks[i],
                        amount: money,
                        user: req.user._id
                    });

                    if (data.stock === 0) {
                        await Inventory.findByIdAndRemove(data.id);
                    } else {
                        await data.save();
                    }
                } else {
                    req.flash('error', 'Not enough stock available for item ' + i);
                }
            } else {
                req.flash('error', 'Medicine with ID ' + medicineIds[i] + ' does not exist');
            }
        }
        // Generate the PDF and get the file path
        const pdfFilePath = await createSellInfoPDF(req.user._id, medicineIds, stocks, req.body.buyer_name, req.body.mobile_number, req.user.name);

        if (req.xhr) {
            return res.status(200).json({
                data: {
                    pdfFilePath: pdfFilePath
                },
                message: "Updated!"
            });
        }
        // Respond with the PDF file path
        req.flash('success', 'Stock updated successfully');

        return res.redirect('back');
    } catch (err) {
        req.flash('error', err.message);
        return res.redirect('back');
    }
}

async function createSellInfoPDF(userId, medicineIds, stocks, name, mobile, sellername) {
    const pdfFilePath = `sell_info_${userId}.pdf`;
    const doc = new PDFDocument();

    // Pipe the PDF content to a writable stream
    const pdfStream = fs.createWriteStream(pdfFilePath);
    doc.pipe(pdfStream);

    // Set the title with "BILL"
    doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('SHIPRASH - BILL', { align: 'center' });

    // Display the buyer's name, mobile number, and date
    doc
        .fontSize(12)
        .moveDown()
        .text(`Name: ${name}`)
        .text(`Mobile Number: ${mobile}`)
        .text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`)
        .text(`Sell By: ${sellername}`);

    // Define the table headers
    const tableHeaders = ['Medicine ID', 'Name', 'Unit', 'Cost Each', 'Amount'];

    // Initialize positions and row height for the table
    let tableX = 50;
    const tableY = 200; // Adjust the Y position to leave space for the title and buyer info
    const rowHeight = 30;

    // Draw table headers
    doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(tableHeaders[0], tableX, tableY)
        .text(tableHeaders[1], tableX + 100, tableY)
        .text(tableHeaders[2], tableX + 200, tableY)
        .text(tableHeaders[3], tableX + 300, tableY)
        .text(tableHeaders[4], tableX + 400, tableY); // Use '4' to represent the "Money" column

    // Initialize total amount
    let totalAmount = 0;

    // Draw table rows with SellInfo data
    for (let i = 0; i < medicineIds.length; i++) {
        const data = await Inventory.findOne({ medicine_id: medicineIds[i] });
        if (data) {
            const y = tableY + (i + 1) * rowHeight;

            const costEach = data.price;
            const unit = stocks[i];
            const amount = costEach * unit;

            // Calculate GST and CGST (18% each)
            const gst = 0.18 * amount;
            const cgst = 0.18 * amount;

            // Round off GST, CGST, and amount to two decimal places
            const roundedGst = parseFloat(gst.toFixed(2));
            const roundedCgst = parseFloat(cgst.toFixed(2));
            const roundedAmount = parseFloat(amount.toFixed(2));

            doc
                .font('Helvetica')
                .fontSize(12)
                .text(data.medicine_id, tableX, y)
                .text(data.name, tableX + 100, y)
                .text(unit.toString(), tableX + 200, y)
                .text(costEach.toString(), tableX + 300, y)
                .text(roundedAmount.toString(), tableX + 400, y); // Use 'data.price * stocks[i]' for the "Money" column

            totalAmount += amount;
        }
    }

    // Draw a line at the bottom of the table
    doc
        .moveTo(tableX, tableY + (medicineIds.length + 1) * rowHeight)
        .lineTo(tableX + 600, tableY + (medicineIds.length + 1) * rowHeight) // Adjust the line width
        .stroke();

    // Calculate GST and CGST totals
    const gstTotal = 0.18 * totalAmount;
    const cgstTotal = 0.18 * totalAmount;

    // Round off GST and CGST totals to two decimal places
    const roundedGstTotal = parseFloat(gstTotal.toFixed(2));
    const roundedCgstTotal = parseFloat(cgstTotal.toFixed(2));
    const grandtotal = parseFloat((totalAmount + gstTotal + cgstTotal).toFixed(2));
    // Draw the total, GST, CGST, and grand total in the desired order
    doc
        .fontSize(14)
        .text(`Total: Rs. ${totalAmount}`, tableX, tableY + (medicineIds.length + 2) * rowHeight)
        .text(`GST (18%): Rs. ${roundedGstTotal}`, tableX, tableY + (medicineIds.length + 3) * rowHeight)
        .text(`CGST (18%): Rs. ${roundedCgstTotal}`, tableX, tableY + (medicineIds.length + 4) * rowHeight)
        .text(`Grand Total: Rs. ${grandtotal}`, tableX, tableY + (medicineIds.length + 5) * rowHeight);

    // Finalize the PDF
    doc.end();
    return pdfFilePath;
}





module.exports.downloadPDF = function (req, res) {
    const { userid } = req.params;

    // Construct the full path to the PDF file (or wherever your PDF is generated)
    const parentDirectory = path.join(__dirname, '..'); // Navigate to the parent directory
    const filePath = path.join(parentDirectory, `sell_info_${userid}.pdf`);
    // Set the response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sell_info_${userid}.pdf`);

    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
}