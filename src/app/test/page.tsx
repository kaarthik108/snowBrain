"use client";

import React, { useEffect, useState } from 'react';

const TestPage: React.FC = () => {
    const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    useEffect(() => {
        const fetchData = async () => {
            const body = {
                "script": "import seaborn as sns\nimport matplotlib.pyplot as plt\n\n# Assuming the query result is stored in a pandas DataFrame called 'df'\nsns.barplot(x='CATEGORY', y='TOTAL_REVENUE', data=df)\nplt.xlabel('Product Category')\nplt.ylabel('Total Revenue')\nplt.title('Total Revenue for Each Product Category')\nplt.xticks(rotation=45)\nplt.show()",
                "sql": "SELECT p.CATEGORY, SUM(t.PRICE * t.QUANTITY) AS TOTAL_REVENUE\nFROM STREAM_HACKATHON.STREAMLIT.PRODUCTS p\nJOIN STREAM_HACKATHON.STREAMLIT.TRANSACTIONS t ON p.PRODUCT_ID = t.PRODUCT_ID\nJOIN STREAM_HACKATHON.STREAMLIT.ORDER_DETAILS o ON t.ORDER_ID = o.ORDER_ID\nJOIN STREAM_HACKATHON.STREAMLIT.PAYMENTS pm ON o.ORDER_ID = pm.ORDER_ID\nGROUP BY p.CATEGORY;"
            };
            const response = await fetch('http://127.0.0.1:8000/execute', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                // Handle any errors here
                console.log("Error", response);
                return;
            }
            console.log("Response", response);
            // Assuming the response is base64 encoded image
            const imageData = await response.blob();
            console.log("Response Data", imageData);
            // Generate form data
            const formData = new FormData();
            formData.append('file', imageData);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

            // upload to Cloudinary
            const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            const cloudinaryData = await cloudinaryResponse.json();

            console.log("Cloudinary Response: ", cloudinaryData);

            // set the url to state
            setCloudinaryUrl(cloudinaryData.url);
        };

        fetchData();
    }, []);

    return (
        <div>
            <h1>Test Page</h1>
            {cloudinaryUrl && <img src={cloudinaryUrl} alt="Uploaded to Cloudinary" />}
        </div>
    );
};

export default TestPage;
