const fileInput = document.getElementById('file-input');
const loading = document.getElementById('loading');
const progressBar = document.getElementById('progress-bar');
const resultArea = document.getElementById('result-area');
const sizeReport = document.getElementById('size-report');

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (150MB limit)
    if (file.size > 150 * 1024 * 1024) {
        alert("File too large! Please keep it under 150MB.");
        return;
    }

    loading.style.display = 'block';
    resultArea.style.display = 'none';
    progressBar.style.width = '0%';

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        
        // FAKE PROGRESS (Since PDF-Lib save is one-shot)
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            if (progress <= 90) progressBar.style.width = progress + '%';
        }, 200);

        // Actual Processing
        const compressedBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            updateFieldAppearances: false
        });

        clearInterval(interval);
        progressBar.style.width = '100%';

        const blob = new Blob([compressedBytes], { type: "application/pdf" });
        const finalSize = (blob.size / (1024 * 1024)).toFixed(2);
        const originalSize = (file.size / (1024 * 1024)).toFixed(2);

        sizeReport.innerText = `Original: ${originalSize}MB | Compressed: ${finalSize}MB`;
        
        const url = URL.createObjectURL(blob);
        document.getElementById('download-btn').onclick = () => {
            const link = document.createElement('a');
            link.href = url;
            link.download = `optimized_${file.name}`;
            link.click();
        };

        setTimeout(() => {
            loading.style.display = 'none';
            resultArea.style.display = 'block';
        }, 500);

    } catch (err) {
        alert("Error: " + err.message);
        loading.style.display = 'none';
    }
});
