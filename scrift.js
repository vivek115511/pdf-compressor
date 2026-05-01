const input = document.getElementById('file-input');

input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if(!file) return;

    // Switch UI
    document.getElementById('upload-stage').style.display = 'none';
    document.getElementById('process-stage').style.display = 'block';
    
    const bar = document.getElementById('bar');
    bar.style.width = "40%";

    const formData = new FormData();
    formData.append('file', file);

    try {
        // REPLACE with your Render/Railway URL
        const response = await fetch('https://your-api-url.com/compress', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            bar.style.width = "100%";
            const blob = await response.blob();
            
            const oldSize = (file.size / 1024 / 1024).toFixed(1);
            const newSize = (blob.size / 1024 / 1024).toFixed(1);

            document.getElementById('process-stage').style.display = 'none';
            document.getElementById('download-stage').style.display = 'block';
            document.getElementById('stat-result').innerText = `${oldSize}MB reduced to ${newSize}MB!`;
            
            const url = URL.createObjectURL(blob);
            document.getElementById('dl-btn').onclick = () => {
                const a = document.createElement('a');
                a.href = url;
                a.download = `Compressed_${file.name}`;
                a.click();
            };
        }
    } catch (err) {
        alert("Server connection required for high compression.");
    }
});
