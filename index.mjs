import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET;

export const handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body);

    // Step 1: Fetch the logo from Supabase
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${SUPABASE_BUCKET}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    const files = await response.json();
    const userLogo = files.find(file => file.name.includes(email));

    if (!userLogo) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Logo not found for the specified email.' }),
      };
    }

    // Step 2: Return the public URL of the logo
    const logoUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${userLogo.name}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ logoUrl }),
    };

  } catch (error) {
    console.error('Error fetching logo:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
