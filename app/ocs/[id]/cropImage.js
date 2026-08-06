function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    if (!url.startsWith('data:')) {
      img.setAttribute('crossOrigin', 'anonymous')
    }
    img.src = url
  })
}

export async function getCroppedImg(imageSrc, cropPixels) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = cropPixels.width
  canvas.height = cropPixels.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(
    image,
    cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
    0, 0, cropPixels.width, cropPixels.height
  )
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9)
  })
}
