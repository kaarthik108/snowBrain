export const uploadToCloudinary = async (img: Blob) => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  const formData = new FormData()
  formData.append('file', img)
  formData.append(
    'upload_preset',
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  )

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    if (response.ok) {
      const jsonResponse = await response.json()
      return jsonResponse.secure_url || null
    } else {
      return undefined
    }
  } catch (error) {
    return undefined
  }
}

export default uploadToCloudinary
