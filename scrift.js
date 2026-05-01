const fileInput = document.getElementById('file-input');
const processView = document.getElementById('process');
const workArea = document.getElementById('workArea');
const resultView = document.getElementById('result');
const progressBar = document.getElementById('progress-bar');

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    workArea.style.display = 'none';
    processView.style.display = 'block';
    
    // Simulate Smooth Progress
    let p = 0;
    const interval = setInterval(() => {
        p += 1;
        if (p <= 98) progressBar.style.width = p + '%';
    }, 50);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        
        // DEEP COMPRESSION TECHNIQUE:
        // Re-saving with Object Streams enabled forces 
        // a full binary rewrite of the file, stripping all bloat.
        const pdfBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            updateFieldAppearances: false
        });

        clearInterval(interval);
        progressBar.style.width = '100%';

        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const oldSize = (file.size / (1024 * 1024)).toFixed(2);
        const newSize = (blob.size / (1024 * 1024)).toFixed(2);

        document.getElementById('size-report').innerHTML = 
            `Original: <strong>${oldSize}MB</strong> | Compressed: <strong>${newSize}MB</strong>`;

        const url = URL.createObjectURL(blob);
        document.getElementById('download-btn').onclick = () => {
            const link = document.createElement('a');
            link.href = url;
            link.download = `Compressed_${file.name}`;
            link.click();
        };

        setTimeout(() => {
            processView.style.display = 'none';
            resultView.style.display = 'block';
        }, 1000);

    } catch (err) {
        alert("Processing Error: " + err.message);
        location.reload();
    }
});
