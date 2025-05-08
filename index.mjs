// index.mjs
import fetch from "node-fetch";

export const handler = async (event) => {
    console.log("Event Received:", event);
    
    const { email, pdfData } = JSON.parse(event.body);

    if (!email || !pdfData) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Invalid request. Email and PDF data are required.",
            }),
        };
    }

    // Fetch logo from Supabase
    const logoUrl = `https://your-supabase-url.storage.supabase.co/storage/v1/object/public/logos/${email}/logo.jpg`;

    // Mock watermark processing
    console.log(`Processing watermark for ${email}`);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Watermarked PDF for ${email} generated successfully.`,
            logoUrl: logoUrl
        }),
    };
};
