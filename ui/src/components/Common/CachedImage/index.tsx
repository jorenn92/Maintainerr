import Image, { ImageProps } from 'next/image'
import React from 'react'

/**
 * The CachedImage component should be used wherever
 * we want to offer the option to locally cache images.
 *
 * It uses the `next/image` Image component but overrides
 * the `unoptimized` prop based on the application setting `cacheImages`.
 **/
const CachedImage: React.FC<ImageProps> = (props) => {
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      unoptimized={false}
      onError={(e) => {
        console.warn('Image failed to load: ', e)
      }}
      {...props}
    />
  )
}

export default CachedImage
