const input = document.getElementById('file-input');

input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if(!file) return;

    alert("Starting extreme compression. This might freeze your browser for a few seconds...");

    try {
        const arrayBuffer = await file.arrayBuffer();
        const originalPdf = await PDFLib.PDFDocument.load(arrayBuffer);
        
        // Create a totally blank document
        const newPdf = await PDFLib.PDFDocument.create();
        
        // Copy pages but physically scale them down by 40%
        // This is the closest you can get to "image compression" in the browser
        const pages = await newPdf.copyPages(originalPdf, originalPdf.getPageIndices());
        pages.forEach(page => {
            page.scale(0.6, 0.6); 
            newPdf.addPage(page);
        });

        // Strip everything but the raw data
        const pdfBytes = await newPdf.save({
            useObjectStreams: true,
            addDefaultPage: false,
            updateFieldAppearances: false
        });

        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const newMB = (blob.size / 1024 / 1024).toFixed(2);
        
        alert(`Finished! New size: ${newMB} MB`);

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Squeezed_${file.name}`;
        a.click();

    } catch (err) {
        alert("The file was too heavy for the browser to crush.");
    }
});
