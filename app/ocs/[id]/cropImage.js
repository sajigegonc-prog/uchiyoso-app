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

const MAX_SIZE = 400

export async function getCroppedImg(imageSrc, cropPixels) {
  const image = await createImage(imageSrc)

  const outputSize = Math.min(MAX_SIZE, cropPixels.width, cropPixels.height) || MAX_SIZE

  const canvas = document.createElement('canvas')
  canvas.width = outputSize
  canvas.height = outputSize
  const ctx = canvas.getContext('2d')
  ctx.drawImage(
    image,
    cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
    0, 0, outputSize, outputSize
  )
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8)
  })
}
