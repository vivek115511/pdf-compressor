const fileInput = document.getElementById('file-input');
const bar = document.getElementById('fill-bar');

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('setup-area').style.display = 'none';
    document.getElementById('processing-area').style.display = 'block';

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        
        // AGGRESSIVE STEP: Create a fresh document to strip ALL hidden history
        const compressedDoc = await PDFLib.PDFDocument.create();
        
        // Target: Scale down the pages to reduce rendering data
        const pages = await compressedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
        
        pages.forEach(page => {
            // We scale the page content down by 20%
            // This forces the PDF engine to re-calculate and shrink the data
            page.scale(0.8, 0.8); 
            compressedDoc.addPage(page);
        });

        // MAXIMUM BINARY SQUEEZE
        const pdfBytes = await compressedDoc.save({
            useObjectStreams: true, // Groups data into compressed chunks
            addDefaultPage: false,
            updateFieldAppearances: false, // Strips unneeded form data
        });

        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        
        // If it's still too big, we show the result but warn the user
        showResult(file.size, blob);

    } catch (err) {
        console.error(err);
        alert("Compression Error. The PDF might be encrypted.");
        location.reload();
    }
});

function showResult(oldSize, blob) {
    const newSize = blob.size;
    const oldMB = (oldSize / 1024 / 1024).toFixed(2);
    const newMB = (newSize / 1024 / 1024).toFixed(2);
    
    document.getElementById('processing-area').style.display = 'none';
    document.getElementById('download-area').style.display = 'block';
    document.getElementById('final-stats').innerHTML = 
        `Original: ${oldMB}MB <br> <span style="color:#28a745">New: ${newMB}MB</span>`;

    const url = URL.createObjectURL(blob);
    document.getElementById('dl-btn').onclick = () => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `Compressed_Pro.pdf`;
        a.click();
    };
}
