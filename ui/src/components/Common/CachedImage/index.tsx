import Image, { ImageProps } from 'next/image'
import React from 'react'
import SettingsContext from '../../../contexts/settings-context'

/**
 * The CachedImage component should be used wherever
 * we want to offer the option to locally cache images.
 *
 * It uses the `next/image` Image component but overrides
 * the `unoptimized` prop based on the application setting `cacheImages`.
 **/
const CachedImage: React.FC<ImageProps> = (props) => {
  const settingsCtx = React.useContext(SettingsContext)

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      unoptimized={settingsCtx.settings.cacheImages ? false : true}
      {...props}
    />
  )
}

export default CachedImage
