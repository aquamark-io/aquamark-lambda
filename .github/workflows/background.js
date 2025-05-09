// Chrome Extension Background Script

// Initialize Supabase client
const SUPABASE_URL = 'https://dvzmnikrvkvgragzhrof.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2em1uaWtydmt2Z3JhZ3pocm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5Njg5NzUsImV4cCI6MjA1OTU0NDk3NX0.FaHsjIRNlgf6YWbe5foz0kJFtCO4FuVFo7KVcfhKPEk';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Background Listener for Icon Click
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'watermark') {
        handleWatermarking(request.email, request.files)
            .then(response => sendResponse({ success: true, data: response }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
    if (request.action === 'storeToken') {
        chrome.storage.local.set({ accessToken: request.token }, () => {
            console.log('Access token stored successfully');
        });
    }
});

// Function to handle watermarking process
async function handleWatermarking(userEmail, files) {
    const { data: userData, error } = await supabase
        .from('usage')
        .select('*')
        .eq('user_email', userEmail)
        .single();

    if (error || !userData) throw new Error('User not found');

    const logoUrl = await getLogoUrl(userEmail);

    if (!logoUrl) throw new Error('Logo not found');

    const totalPageCount = await countPages(files);
    if (totalPageCount > userData.pages_remaining) {
        throw new Error('Insufficient page credits');
    }

    const processedFiles = await watermarkFiles(files, logoUrl);

    const updatedPagesRemaining = userData.pages_remaining - totalPageCount;
    await supabase
        .from('usage')
        .update({ pages_remaining: updatedPagesRemaining })
        .eq('user_email', userEmail);

    return processedFiles;
}

async function getLogoUrl(email) {
    const { data: files, error } = await supabase.storage
        .from('logos')
        .list(email);

    if (error || !files.length) return null;

    files.sort((a, b) => parseInt(b.name.split('-')[1]) - parseInt(a.name.split('-')[1]));
    const latestLogo = files[0].name;

    const { data } = supabase.storage.from('logos').getPublicUrl(`${email}/${latestLogo}`);
    return data.publicUrl;
}

async function countPages(files) {
    let totalPages = 0;
    for (const file of files) {
        const pdfDoc = await PDFLib.PDFDocument.load(await file.arrayBuffer());
        totalPages += pdfDoc.getPageCount();
    }
    return totalPages;
}

async function watermarkFiles(files, logoUrl) {
    const processedFiles = [];
    for (const file of files) {
        const pdfDoc = await PDFLib.PDFDocument.load(await file.arrayBuffer());
        const logoImage = await pdfDoc.embedPng(logoUrl);
        const pages = pdfDoc.getPages();
        pages.forEach(page => {
            page.drawImage(logoImage, {
                x: 50,
                y: 50,
                width: 100,
                height: 100,
                opacity: 0.2
            });
        });
        const pdfBytes = await pdfDoc.save();
        processedFiles.push(new Blob([pdfBytes], { type: 'application/pdf' }));
    }
    return processedFiles;
}
